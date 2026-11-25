// EP06 THE CATCH. A generic super-heavy two-stage steel rocket and a lattice launch tower with catch arms at a Gulf-coast pad at dusk.
// Proportioned from public figures (booster ~72 m, ship ~52 m, 9 m diameter, 33 + 6 engines) but an illustration, not a replica. 1 unit = 1 m.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, skyEnv, box, cyl, std, canvasTex, eout, smooth } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;
const R = 4.5, BH = 72, SH = 52, MOUNT = 20;
const ARM_Y = MOUNT + BH - 4; // grid fins sit on the arms

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.3, 30000);
  const rnd = mulberry(1515);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    pertama: A_("s2:pertama", s.s2 + 9), heavy: A_("s3:Super", s.s3 + 3), kapal: A_("s3:kapal", s.s3 + 6), tinggi: A_("s3:Tingginya", s.s3 + 9),
    raptor: A_("s4:Raptor", s.s4 + 1), dorong: A_("s4:mendorong", s.s4 + 5), kali: A_("s4:Kalikan", s.s4 + 8),
    pisah: A_("s5:berpisah", s.s5 + 4), balik: A_("s5:berbalik", s.s5 + 6), pulang: A_("s5:pulang", s.s5 + 9),
    mecha: A_("s6:Mechazilla", s.s6 + 1.5), hidrolik: A_("s6:hidrolik", s.s6 + 5), melayang: A_("s6:melayang", s.s6 + 7), sirip: A_("s6:sirip", s.s6 + 9.5), kaki: A_("s6:kaki", s.s6 + 12),
    perut: A_("s7:perut", s.s7 + 1.5), ubin: A_("s7:ubin", s.s7 + 5), berputar: A_("s7:berputar", s.s7 + 10),
    dibuang: A_("s8:dibuang", s.s8 + 2), lagi: A_("s8:lagi", s.s8 + 6),
  };

  const S = new THREE.Scene();
  const SUN = v3(-0.8, 0.12, -0.55).normalize();
  const SKY = { uS: { value: SUN }, uAlt: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(20000, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: SKY,
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform vec3 uS;uniform float uAlt;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){vec3 n=normalize(v);float y=n.y;
      vec3 dusk=mix(vec3(1.25,.55,.32),vec3(.16,.2,.42),pow(clamp(y,0.,1.),.42));dusk=mix(dusk,vec3(.12,.08,.1),smoothstep(0.,-.12,y));
      float hz=-.25*uAlt;vec3 space=mix(vec3(.25,.45,1.)*.9,vec3(.004,.006,.015),smoothstep(hz-.02,hz+.25,y));space=mix(space,vec3(.03,.05,.09),smoothstep(hz,hz-.05,y));
      vec3 c=mix(dusk,space,uAlt);float d=max(dot(n,uS),0.);c+=vec3(1.,.62,.35)*(pow(d,700.)*20.+pow(d,8.)*.45*(1.-uAlt));
      vec2 q=floor(n.xz*900.+n.y*300.);c+=vec3(.9)*step(.9985,h(q))*uAlt*smoothstep(hz+.1,hz+.4,y);gl_FragColor=vec4(c,1.);}`,
  }));
  S.add(sky);
  S.environment = skyEnv(r, 0x3a4a78, 0xd98a5a, 0x1a1414, SUN, 0xffa06a, 3);
  S.environmentIntensity = 0.7;
  const sun = new THREE.DirectionalLight(0xffa877, 3.4);
  sun.position.copy(SUN).multiplyScalar(500); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 220, bottom: -40, near: 10, far: 1500 }); sun.shadow.bias = -0.0005;
  S.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0x8aa0d0, 0x2a1d18, 0.6); S.add(hemi);

  // ground: pad concrete, coastal flats, sea
  const ground = new THREE.Group(); S.add(ground);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), new THREE.MeshStandardMaterial({ color: 0x1b2a3a, roughness: 0.18, metalness: 0.6 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.6; ground.add(sea);
  const flats = new THREE.Mesh(new THREE.CircleGeometry(900, 64), std(0x9c8a6c, 0.95)); flats.rotation.x = -Math.PI / 2; flats.position.set(-300, -0.3, 200); ground.add(flats);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(110, 64), std(0x8c8a86, 0.85)); pad.rotation.x = -Math.PI / 2; pad.receiveShadow = true; ground.add(pad);
  const pad2 = pad.clone(); pad2.position.set(420, 0, -160); ground.add(pad2);

  // launch mount
  const steelM = new THREE.MeshPhysicalMaterial({ color: 0xd2d6db, roughness: 0.28, metalness: 0.95, clearcoat: 0.2 });
  const darkSteel = std(0x3c4148, 0.5, 0.8);
  const mount = new THREE.Group(); ground.add(mount);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; box(2.4, MOUNT - 2, 2.4, darkSteel, Math.cos(a) * 9, (MOUNT - 2) / 2, Math.sin(a) * 9, mount); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(8.2, 1.6, 10, 40), darkSteel); ring.rotation.x = Math.PI / 2; ring.position.y = MOUNT - 1; mount.add(ring);

  // tower: four columns with cross bracing, a carriage and two catch arms
  function makeTower(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); ground.add(g);
    const TH = 146, Wd = 8;
    const bars = [];
    for (const [cx, cz] of [[-Wd, -Wd], [Wd, -Wd], [-Wd, Wd], [Wd, Wd]]) bars.push([v3(cx, 0, cz), v3(cx, TH, cz)]);
    for (let yy = 0; yy < TH; yy += 9) {
      const pts = [[-Wd, -Wd], [Wd, -Wd], [Wd, Wd], [-Wd, Wd]];
      for (let k = 0; k < 4; k++) {
        const a = pts[k], b = pts[(k + 1) % 4];
        bars.push([v3(a[0], yy, a[1]), v3(b[0], yy + 9, b[1])]);
        bars.push([v3(a[0], yy, a[1]), v3(b[0], yy, b[1])]);
      }
    }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), darkSteel, bars.length);
    const o = new THREE.Object3D(), Z = v3(0, 0, 1), q = new THREE.Quaternion();
    bars.forEach(([a, b], i) => { const d = b.clone().sub(a); o.position.copy(a).addScaledVector(d, 0.5); q.setFromUnitVectors(Z, d.clone().normalize()); o.quaternion.copy(q); o.scale.set(0.9, 0.9, d.length()); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.castShadow = true; g.add(im);
    box(20, 5, 20, darkSteel, 0, TH + 2.5, 0, g);
    const carriage = new THREE.Group(); g.add(carriage);
    box(19, 7, 19, std(0x5a6068, 0.45, 0.85), 0, 0, 0, carriage);
    const arms = [-1, 1].map((sg) => {
      const piv = new THREE.Group(); piv.position.set(Wd + 1, 0, sg * 6.2); carriage.add(piv);
      const arm = box(34, 4.5, 2.2, std(0x6b7178, 0.4, 0.85), 17, 0, 0, piv);
      box(30, 0.5, 0.6, std(0xffc24a, 0.5, 0.2, { emissive: 0xff9a2a, emissiveIntensity: 0.4 }), 18, 2.5, 0, piv);
      return { piv, sg };
    });
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    return { g, carriage, arms };
  }
  const TX = -20;
  const T1 = makeTower(TX, 0);
  const T2 = makeTower(420 + TX, -160);
  const setArms = (T, y, open) => { T.carriage.position.y = y; T.arms.forEach(({ piv, sg }) => { piv.rotation.y = sg * open * 0.95; }); };

  // tile texture: steel on the lee side, hexagonal black tiles on the windward half
  const tileTex = canvasTex(2048, 1024, (c, w, h) => {
    c.fillStyle = "#cfd3d8"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) { c.fillStyle = "rgba(90,96,104,.25)"; c.fillRect(0, y, w, 2); }
    c.fillStyle = "#16181b"; c.fillRect(w * 0.25, 0, w * 0.5, h);
    c.strokeStyle = "rgba(70,74,80,.9)"; c.lineWidth = 2;
    const s6 = 16;
    for (let y = 0, row = 0; y < h + s6; y += s6 * 1.5, row++) for (let x = w * 0.25 + (row % 2) * s6 * 0.866; x < w * 0.75; x += s6 * 1.732) {
      c.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + Math.cos(a) * s6, y + Math.sin(a) * s6); } c.closePath(); c.stroke();
    }
  });
  const shipM = new THREE.MeshPhysicalMaterial({ map: tileTex, roughness: 0.35, metalness: 0.7, clearcoat: 0.2 });
  // booster
  const booster = new THREE.Group(); S.add(booster);
  const bBody = cyl(R, R, BH, 64, steelM, 0, BH / 2, 0, booster);
  for (let k = 0; k < 6; k++) cyl(R + 0.05, R + 0.05, 0.3, 64, darkSteel, 0, 6 + k * 12, 0, booster);
  const fins = [0, 1, 2].map((k) => { const a = k / 3 * Math.PI * 2 + Math.PI / 2; const f = box(1, 7, 5, darkSteel, Math.cos(a) * (R + 2.2), BH - 4, Math.sin(a) * (R + 2.2), booster); f.rotation.y = -a; return f; });
  const engM = new THREE.MeshStandardMaterial({ color: 0x5a4a40, roughness: 0.4, metalness: 0.9, emissive: 0xff8a3a, emissiveIntensity: 0 });
  const engGeo = new THREE.CylinderGeometry(0.35, 0.65, 2.2, 16, 1, true);
  const engPos = [];
  [[3, 1.1], [10, 2.5], [20, 3.85]].forEach(([n, rr]) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; engPos.push([Math.cos(a) * rr, Math.sin(a) * rr]); } });
  const engines = new THREE.InstancedMesh(engGeo, engM, engPos.length);
  const dm = new THREE.Object3D();
  engPos.forEach(([x, z], i) => { dm.position.set(x, -1.1, z); dm.updateMatrix(); engines.setMatrixAt(i, dm.matrix); });
  booster.add(engines);
  const engGlow = new THREE.InstancedMesh(new THREE.CircleGeometry(0.62, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.2, 0.9), transparent: true, opacity: 0 }), engPos.length);
  engPos.forEach(([x, z], i) => { dm.position.set(x, -2.25, z); dm.rotation.set(Math.PI / 2, 0, 0); dm.updateMatrix(); engGlow.setMatrixAt(i, dm.matrix); });
  dm.rotation.set(0, 0, 0);
  booster.add(engGlow);
  // ship
  const ship = new THREE.Group(); S.add(ship);
  const sBody = new THREE.Mesh(new THREE.CylinderGeometry(R, R, SH - 14, 64, 1, true), shipM); sBody.position.y = (SH - 14) / 2; sBody.castShadow = true; ship.add(sBody);
  const nosePts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; nosePts.push(new THREE.Vector2(R * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.05 * u), u * 14)); }
  const nose = new THREE.Mesh(new THREE.LatheGeometry(nosePts, 64), shipM); nose.position.y = SH - 14; nose.castShadow = true; ship.add(nose);
  const flapM = std(0x2a2d31, 0.5, 0.6);
  [[-1, 6], [1, 6], [-1, SH - 9], [1, SH - 9]].forEach(([sg, y], i) => { const f = box(4.2, i < 2 ? 10 : 7, 0.6, flapM, sg * (R + 1.8), y, 1.5, ship); f.rotation.y = 0; });
  const sEng = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.4, 0.9, 2.6, 16, 1, true), engM, 6);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, rr = i % 2 ? 2.8 : 1.3; dm.position.set(Math.cos(a) * rr, -1.3, Math.sin(a) * rr); dm.updateMatrix(); sEng.setMatrixAt(i, dm.matrix); }
  ship.add(sEng);
  // reentry plasma shell
  const plasma = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.25, R * 1.25, SH * 1.05, 48, 1, true), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uI: { value: 0 }, uT: { value: 0 } },
    vertexShader: "varying vec3 vN,vV;varying vec3 vP;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: "uniform float uI,uT;varying vec3 vN,vV;varying vec3 vP;void main(){float f=pow(1.-abs(dot(vN,vV)),2.);float side=smoothstep(.3,-.9,vP.z/4.5);float fl=.7+.3*sin(vP.y*1.3-uT*30.);gl_FragColor=vec4(vec3(2.6,.9,1.4)*f*side*fl*uI,1.);}",
  }));
  plasma.position.y = SH / 2; ship.add(plasma);
  // exhaust plume (shared by booster and ship)
  const mkPlume = (len, rad) => {
    const g = new THREE.CylinderGeometry(rad * 0.55, rad * 2.4, len, 40, 20, true); g.translate(0, -len / 2, 0);
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uI: { value: 0 }, uT: { value: 0 }, uL: { value: len } },
      vertexShader: "varying vec3 vP;varying vec3 vN,vV;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}",
      fragmentShader: "uniform float uI,uT,uL;varying vec3 vP;varying vec3 vN,vV;void main(){float u=-vP.y/uL;float core=pow(abs(dot(vN,vV)),1.2);float dia=.75+.25*sin(u*60.-uT*4.);vec3 c=mix(vec3(3.2,2.4,1.6),vec3(2.4,.8,.25),smoothstep(0.,.5,u));float a=(1.-smoothstep(.0,1.,u))*core*dia*uI;gl_FragColor=vec4(c*a,1.);}" });
    return new THREE.Mesh(g, m);
  };
  const bPlume = mkPlume(70, 4.2); bPlume.position.y = -2; booster.add(bPlume);
  const sPlume = mkPlume(40, 2.6); sPlume.position.y = -2.4; ship.add(sPlume);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3, 1.5), transparent: true, opacity: 0, depthWrite: false }));
  S.add(flash);
  const boostLight = new THREE.PointLight(0xffb070, 0, 0, 1.6); booster.add(boostLight); boostLight.position.y = -8;
  // smoke clouds at liftoff
  const NS = 500; const SD = []; for (let i = 0; i < NS; i++) SD.push({ a: rnd() * Math.PI * 2, sp: 10 + rnd() * 30, tb: rnd() * 2, k: rnd() });
  const sG = new THREE.BufferGeometry(); const sP = new Float32Array(NS * 3), sS = new Float32Array(NS), sA = new Float32Array(NS);
  sG.setAttribute("position", new THREE.BufferAttribute(sP, 3)); sG.setAttribute("sz", new THREE.BufferAttribute(sS, 1)); sG.setAttribute("al", new THREE.BufferAttribute(sA, 1));
  const smoke = new THREE.Points(sG, new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    vertexShader: "attribute float sz,al;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*2790./max(1.,-mv.z);vA=al;}",
    fragmentShader: "varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vec3(.85,.72,.62),vA*pow(1.-d,1.5));}" }));
  smoke.frustumCulled = false; S.add(smoke);

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.6, 0.5, 1.1));
  comp.addPass(new OutputPass());
  const look = (p, q) => { cam.position.copy(p); cam.lookAt(q); };
  const lv = (a, b, u) => a.clone().lerp(b, u);

  // catch sequence: u 0..1 -> booster from high descent to resting on the arms
  function catchPose(u) {
    const y = MOUNT + BH + 60 * Math.pow(1 - clamp01(u), 1.6) - BH + 0; // bottom height
    const by = ARM_Y - (BH - 4) + 6 + 120 * Math.pow(1 - clamp01(u / 0.85), 2);
    return { by: Math.max(ARM_Y - (BH - 4) + 0.2, by), burn: u < 0.92 ? 1 : 1 - (u - 0.92) / 0.08, open: 1 - smooth(clamp01((u - 0.78) / 0.18)) };
  }
  return function draw(t) {
    if (!(t >= 0)) t = 0;
    let alt = 0;
    bPlume.material.uniforms.uT.value = sPlume.material.uniforms.uT.value = plasma.material.uniforms.uT.value = t;
    ground.visible = true; T2.g.visible = true;
    booster.rotation.set(0, 0, 0); ship.rotation.set(0, 0, 0); booster.visible = ship.visible = true;
    let bI = 0, sI = 0, pI = 0, fl = 0, eg = 0;
    setArms(T1, ARM_Y + 2, 1); setArms(T2, ARM_Y + 2, 1);
    sA.fill(0);
    const stackOnPad = () => { booster.position.set(0, MOUNT, 0); ship.position.set(0, MOUNT + BH + 1.5, 0); };
    if (t < s.s2) {
      // hook: booster drops onto the arms at dusk
      const u = ramp(t, 0.2, s.s2 - 0.6);
      const p = catchPose(u);
      booster.position.set(0, p.by, 0); ship.visible = false; bI = p.burn * 0.9; eg = p.burn;
      setArms(T1, ARM_Y + 2, p.open);
      look(v3(30 + 8 * u, 4, 60 - 10 * u), v3(-4, 70 + 30 * (1 - u), 0));
    } else if (t < s.s3) {
      stackOnPad(); setArms(T1, ARM_Y + 2, 1);
      const u = (t - s.s2) / (s.s3 - s.s2);
      look(v3(140 - 40 * u, 30 + 10 * u, 190 - 30 * u), v3(-6, 70, 0));
    } else if (t < s.s4) {
      stackOnPad();
      const u = (t - s.s3) / (s.s4 - s.s3);
      const y = THREE.MathUtils.lerp(30, 150, smooth(u));
      look(v3(52, y - 6, 58), v3(0, y, 0));
    } else if (t < s.s5) {
      stackOnPad();
      const ig = ramp(t, E.dorong - 0.6, E.dorong + 1.2);
      eg = ig; bI = ig * 0.25;
      engM.emissiveIntensity = ig * 1.5;
      for (let i = 0; i < NS; i++) { const d = SD[i]; const age = (t * 0.8 + d.tb) % 2; sP[i * 3] = Math.cos(d.a) * (6 + age * d.sp); sP[i * 3 + 1] = 2 + age * 3 * d.k; sP[i * 3 + 2] = Math.sin(d.a) * (6 + age * d.sp); sS[i] = 4 + age * 6; sA[i] = ig * 0.18 * (1 - age / 2); }
      const u = (t - s.s4) / (s.s5 - s.s4);
      look(v3(9 - 2 * u, 3, 12 - 2 * u), v3(0, MOUNT + 4, 0));
    } else if (t < s.s6) {
      // flight: ground drops away, hot staging, booster flip and boostback
      ground.visible = false;
      alt = ramp(t, s.s5, E.pisah);
      const sep = ramp(t, E.pisah - 0.2, E.pisah + 1.8);
      const flip = ramp(t, E.balik - 0.4, E.balik + 2.2);
      booster.position.set(0, -sep * 26, 0); ship.position.set(0, BH + 1.5 + sep * 14, 0);
      booster.rotation.z = flip * Math.PI * 0.95;
      bI = t < E.pisah - 0.3 ? 1 : (t > E.balik + 1.5 ? 0.8 : 0);
      sI = t > E.pisah - 0.5 ? 1 : 0;
      fl = Math.exp(-Math.pow((t - E.pisah) / 0.4, 2));
      flash.position.set(0, BH + 1, 0);
      eg = bI;
      const u = (t - s.s5) / (s.s6 - s.s5);
      look(v3(70 + 30 * u, 60 + 10 * sep, 90 + 20 * u), v3(0, 50 + 10 * sep, 0));
    } else if (t < s.s7) {
      // catch, full sequence from the tower side
      ship.visible = false;
      const u = ramp(t, E.mecha - 0.5, E.sirip + 0.4);
      const p = catchPose(u);
      booster.position.set(0, p.by, 0); bI = p.burn * 0.9; eg = p.burn;
      setArms(T1, ARM_Y + 2, t < E.hidrolik ? 1 - 0.3 * Math.sin(Math.min(1, ramp(t, E.mecha, E.hidrolik)) * Math.PI) : p.open);
      const w = (t - s.s6) / (s.s7 - s.s6);
      look(lv(v3(-60, 70, 70), v3(40, ARM_Y + 6, 46), smooth(w)), v3(-6, ARM_Y - 6, 0));
    } else if (t < s.s8) {
      // ship reentry, belly first, then the flip and landing burn
      ground.visible = t > E.berputar;
      booster.visible = false;
      alt = 1 - ramp(t, E.berputar - 1, E.berputar + 1.5);
      const fp = ramp(t, E.berputar - 0.2, E.berputar + 1.6);
      ship.rotation.x = -(1 - fp) * Math.PI / 2;
      pI = (1 - fp) * ramp(t, s.s7, E.perut + 0.6);
      sI = fp;
      const u = (t - s.s7) / (s.s8 - s.s7);
      ship.position.set(420 + TX + 20, 200 - 40 * u, -160);
      look(v3(420 + TX + 20 + 46 - 10 * u, 214 - 46 * u, -160 + 52), ship.position.clone().add(v3(0, 16, 0)));
    } else {
      // two towers: booster resting on tower 1, ship settling into tower 2
      booster.position.set(0, ARM_Y - (BH - 4) + 0.2, 0); setArms(T1, ARM_Y + 2, 0);
      const u = ramp(t, s.s8, E.lagi + 1);
      const sy = ARM_Y - (SH - 10) + 70 * (1 - u);
      ship.position.set(420 + TX + 20 - 20, sy, -160); sI = u < 0.95 ? 0.8 : 0;
      setArms(T2, sy + SH - 10 + 2, 1 - smooth(clamp01((u - 0.8) / 0.2)));
      T2.carriage.position.y = Math.min(ARM_Y + 2, sy + SH - 8);
      const w = ramp(t, s.s8, s.dur);
      look(v3(-160 - 120 * w, 90 + 60 * w, 420 + 160 * w), v3(200, 70, -80));
    }
    SKY.uAlt.value = alt;
    hemi.intensity = 0.6 * (1 - alt * 0.6);
    bPlume.material.uniforms.uI.value = bI; sPlume.material.uniforms.uI.value = sI;
    plasma.material.uniforms.uI.value = pI;
    boostLight.intensity = bI * 60000;
    engGlow.material.opacity = Math.max(eg, bI);
    flash.material.opacity = fl; flash.scale.setScalar(0.6 + fl);
    sG.attributes.position.needsUpdate = sG.attributes.sz.needsUpdate = sG.attributes.al.needsUpdate = true;
    comp.render();
  };
}
