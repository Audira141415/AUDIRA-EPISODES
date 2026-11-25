// EP04 THE LOAD PATH. A generic cable-stayed bridge at golden hour, proportioned from Suramadu's public figures but not a replica, plus blueprint-table models for each bridge type.
// Compression is always orange, tension always blue. 1 unit = 10 m on the hero bridge.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, track, volumeNoise, noiseGLSL, skyEnv, canvasTex, box, std } from "./lib3d.js";

const C_COMP = new THREE.Color(2.4, 0.72, 0.14), C_TENS = new THREE.Color(0.3, 1.1, 2.6);
const dm = new THREE.Object3D();
const UP = new THREE.Vector3(0, 1, 0);
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const hexComp = 0xff7a2f, hexTens = 0x3fa7ff;

function member(a, b, r, mat, parent, seg = 8) {
  const d = b.clone().sub(a), L = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  m.castShadow = true;
  parent.add(m);
  return m;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.05, 6000);
  const rnd = mulberry(434);
  const noise = volumeNoise(64, 91);
  const SUN = v3(0.62, 0.27, 0.72).normalize();
  const env = skyEnv(r, 0x3f6d9f, 0xf2c99a, 0x1a2c33, SUN, 0xffc88a, 6);

  // ========= hero world =========
  const A = new THREE.Scene();
  A.environment = env; A.environmentIntensity = 0.62;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uNoise: { value: noise }, uS: { value: SUN }, uT: { value: 0 } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;varying vec3 v;uniform sampler3D uNoise;uniform vec3 uS;uniform float uT;void main(){vec3 n=normalize(v);float y=max(n.y,0.);
      vec3 c=mix(vec3(1.02,.67,.38),vec3(.13,.28,.55),pow(y,.42));float d=max(dot(n,uS),0.);c+=vec3(1.,.72,.42)*(pow(d,900.)*24.+pow(d,14.)*.42);
      if(n.y>.01){vec2 q=n.xz/(n.y+.12);float a=texture(uNoise,vec3(q*.1+uT*.0005,.2)).r*.68+texture(uNoise,vec3(q*.33,.4)).b*.32;float cl=smoothstep(.58,.8,a)*smoothstep(.0,.16,n.y);
       c=mix(c,mix(vec3(1.,.72,.5),vec3(.82,.78,.8),n.y*2.),cl*.85);}
      gl_FragColor=vec4(c,1.);}`,
  }));
  A.add(sky);
  const sun = new THREE.DirectionalLight(0xffc48e, 3.7);
  sun.position.copy(SUN).multiplyScalar(160); sun.target.position.set(0, 0, 0); A.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.normalBias = 0.05; sun.shadow.bias = -0.0003;
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 1, far: 400 });

  // water
  const WU = { uNoise: { value: noise }, uCam: { value: new THREE.Vector3() }, uSun: { value: SUN }, uTime: { value: 0 } };
  const waterGeo = new THREE.PlaneGeometry(6000, 6000, 1, 1); waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, new THREE.ShaderMaterial({
    uniforms: WU, side: THREE.DoubleSide, fog: false,
    vertexShader: "varying vec3 vW;void main(){vW=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;varying vec3 vW;uniform vec3 uCam,uSun;uniform float uTime;${noiseGLSL}
      float hN(vec2 p,float t){return nA(vec3(p*.009,t*.012))*2.+nC(vec3(p*.04+t*.006,t*.02))*.7+nB(vec3(p*.19-t*.018,t*.05))*.16+nB(vec3(p*.7+t*.03,t*.09))*.05;}
      void main(){vec2 p=vW.xz;float d=length(uCam-vW);float sc=max(1.,d*.02);float e=.35*sc;
      float a=hN(p/sc,uTime),bx=hN((p+vec2(e,0.))/sc,uTime),bz=hN((p+vec2(0.,e))/sc,uTime);
      vec3 n=normalize(vec3(-(bx-a)/e*.34*sc,1.,-(bz-a)/e*.34*sc));vec3 v=normalize(uCam-vW);
      if(uCam.y<0.){gl_FragColor=vec4(vec3(.1,.34,.38),1.);return;}
      float f=.02+.98*pow(1.-max(dot(n,v),0.),5.);vec3 r=reflect(-v,n);r.y=abs(r.y);
      vec3 sk=mix(vec3(1.,.66,.38),vec3(.14,.28,.52),pow(r.y,.42));float g=max(dot(r,uSun),0.);
      vec3 c=mix(vec3(.012,.07,.085),sk,f)+vec3(1.,.72,.42)*(pow(g,420.)*18.+pow(g,30.)*.22);
      c=mix(c,vec3(1.,.72,.46),1.-exp(-d*.00055));gl_FragColor=vec4(c,1.);}`,
  }));
  water.frustumCulled = false; A.add(water);

  const concTex = (a, b, seed) => canvasTex(1024, 1024, (c, w) => {
    const R = mulberry(seed); c.fillStyle = a; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { c.fillStyle = R() > 0.5 ? b : "#000"; c.globalAlpha = 0.012 + R() * 0.05; const q = 2 + R() * 26; c.fillRect(R() * w, R() * w, q, q * R()); }
    c.globalAlpha = 0.16; c.strokeStyle = "#000"; for (let y = 0; y < w; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 1;
  }, [1, 1]);
  const concMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: concTex("#b8b2a7", "#e2dbcd", 4), roughness: 0.82 });
  // Pylon and pile materials take a moving force band. It is one shader so the pulse is continuous from tower to soil.
  const PU = { uBand: { value: -100 }, uGlow: { value: 0 }, uAll: { value: 0 } };
  const pylonMat = concMat.clone();
  pylonMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, PU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvWp=(modelMatrix*vec4(position,1.)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;uniform float uBand,uGlow,uAll;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\nfloat bd=exp(-pow((vWp.y-uBand)/1.5,2.));totalEmissiveRadiance+=vec3(2.4,.72,.14)*(bd*uGlow+uAll*.1*smoothstep(uBand-.5,uBand+1.,vWp.y));");
  };
  const pylons = [];
  const LEGZ = 2.65, TOPZ = 0.85, H = 14.6, PX = 21.7, DY = 3.5;
  [-PX, PX].forEach((px) => {
    const g = new THREE.Group(); g.position.x = px; A.add(g); pylons.push(g);
    [-1, 1].forEach((sg) => {
      const a = v3(0, 0.1, sg * LEGZ), b = v3(0, H, sg * TOPZ);
      const d = b.clone().sub(a);
      const L = d.length();
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.5, L, 4), pylonMat);
      leg.position.copy(a).addScaledVector(d, 0.5);
      leg.quaternion.setFromUnitVectors(UP, d.normalize());
      leg.rotateY(Math.PI / 4);
      leg.castShadow = leg.receiveShadow = true; g.add(leg);
    });
    box(0.48, 0.5, 2 * (LEGZ - 0.2), pylonMat, 0, 2.9, 0, g);
    box(0.36, 0.5, 2 * TOPZ + 0.4, pylonMat, 0, H - 0.4, 0, g);
    box(0.34, 0.42, 2 * (TOPZ + 0.5), pylonMat, 0, 9.3, 0, g);
    // Pile cap and bored piles run under water and into the seabed.
    box(3.8, 1.3, 7.4, concMat, 0, -0.3, 0, g);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 12, 12), pylonMat);
      m.position.set(-1.25 + i * 0.83, -6.8, -2.5 + j); m.castShadow = true; g.add(m);
    }
  });
  // Deck: a single box-girder section extruded along x.
  const secS = new THREE.Shape();
  secS.moveTo(-1.6, 0); secS.lineTo(1.6, 0); secS.lineTo(1.6, -0.07); secS.lineTo(0.85, -0.32); secS.lineTo(-0.85, -0.32); secS.lineTo(-1.6, -0.07); secS.closePath();
  const deckG = new THREE.ExtrudeGeometry(secS, { depth: 260, bevelEnabled: false });
  deckG.rotateY(Math.PI / 2); deckG.translate(-130, DY, 0);
  const deck = new THREE.Mesh(deckG, new THREE.MeshStandardMaterial({ color: 0xc2bdb4, map: concTex("#b0aba1", "#d5d0c4", 8), roughness: 0.8 }));
  deck.material.map.repeat.set(0.1, 0.5); deck.castShadow = deck.receiveShadow = true; A.add(deck);
  const roadTex = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = "#2c2d2f"; c.fillRect(0, 0, w, h);
    const R = mulberry(2);
    for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.05})`; c.fillRect(R() * w, R() * h, 2, 2); }
    c.fillStyle = "#ddd"; c.fillRect(w * 0.49, 0, 4, h);
    c.fillStyle = "#c9c9c9"; [0.08, 0.92].forEach((x) => c.fillRect(w * x, 0, 3, h));
    c.fillStyle = "#e4e4e4"; [0.29, 0.7].forEach((x) => { for (let y = 0; y < h; y += 128) c.fillRect(w * x, y, 3, 64); });
  }, [1, 1]);
  roadTex.repeat.set(1, 120); roadTex.rotation = 0;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 260), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.92 }));
  road.rotation.set(-Math.PI / 2, 0, Math.PI / 2); road.position.y = DY + 0.003; road.receiveShadow = true; A.add(road);
  [-1, 1].forEach((sg) => { box(260, 0.09, 0.04, new THREE.MeshStandardMaterial({ color: 0x8c8f93, metalness: 0.6, roughness: 0.4 }), 0, DY + 0.06, sg * 1.56, A); });
  for (let i = -8; i <= 8; i++) if (Math.abs(Math.abs(i) * 11) > 45) {
    const x = i * 11;
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, DY + 0.5, 12), concMat); pier.position.set(x, DY / 2 - 0.45, 0); pier.castShadow = true; A.add(pier);
    box(0.5, 0.25, 2.2, concMat, x, DY - 0.42, 0, A);
  }
  // Stays: fan from tower to deck. The overlay mesh carries per-cable tension glow.
  const stays = [];
  const steel = new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.34, metalness: 0.75 });
  [-1, 1].forEach((pp) => [-1, 1].forEach((side) => [-1, 1].forEach((pl) => {
    for (let i = 0; i < 12; i++) {
      const u = (i + 1) / 12;
      const y = 8.6 + ((H - 0.7 - 8.6) * (i + 1)) / 12;
      const px = pp * PX;
      stays.push({ a: v3(px, y, pl * (TOPZ + ((y < 9.4 ? 0.3 : 0.05) * 0))), b: v3(px + side * (1.8 * 1 + u * 19.4), DY + 0.05, pl * 1.48), u, side, px });
    }
  })));
  const stayGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
  const stayM = new THREE.InstancedMesh(stayGeo, steel, stays.length);
  const stayGlow = new THREE.InstancedMesh(stayGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), stays.length);
  stays.forEach((c, i) => {
    const d = c.b.clone().sub(c.a), L = d.length();
    dm.position.copy(c.a).addScaledVector(d, 0.5);
    dm.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    dm.scale.set(0.022, L, 0.022); dm.updateMatrix(); stayM.setMatrixAt(i, dm.matrix);
    dm.scale.set(0.03, L, 0.03); dm.updateMatrix(); stayGlow.setMatrixAt(i, dm.matrix);
    stayGlow.setColorAt(i, new THREE.Color(0, 0, 0));
  });
  stayM.castShadow = true; stayM.frustumCulled = stayGlow.frustumCulled = false; A.add(stayM, stayGlow);
  // Traffic with real proportions: cars 4.5 m, trucks 12 m.
  const paints = [0xd8d8dc, 0x222428, 0xa52a24, 0x274f7f, 0x8a8f94, 0xefefef];
  const NV = 56;
  const carShape = new THREE.Shape();
  carShape.moveTo(-0.5, 0); carShape.lineTo(0.5, 0); carShape.lineTo(0.5, 0.5); carShape.lineTo(0.3, 0.6); carShape.lineTo(0.12, 1); carShape.lineTo(-0.28, 1); carShape.lineTo(-0.42, 0.62); carShape.lineTo(-0.5, 0.55); carShape.closePath();
  const carG = new THREE.ExtrudeGeometry(carShape, { depth: 1, bevelEnabled: false }); carG.translate(0, -0.5, -0.5);
  const body = new THREE.InstancedMesh(carG, new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.55 }), NV);
  const cab = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.2, color: 0x1a2028 }), NV);
  const lights = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 2.8, 1.6) }), NV);
  body.frustumCulled = cab.frustumCulled = lights.frustumCulled = false; body.castShadow = true;
  const vs = Array.from({ length: NV }, (_, i) => { const truck = i % 6 === 0; body.setColorAt(i, new THREE.Color(paints[Math.floor(rnd() * 6)])); const dir = i % 2 ? 1 : -1; return { truck, dir, off: rnd(), z: dir * (rnd() > 0.5 ? 0.42 : 1.05), speed: (truck ? 1.3 : 2) * (0.9 + rnd() * 0.2) }; });
  A.add(body, cab, lights);
  // Featured truck: the one the viewer follows.
  const hero = new THREE.Group(); A.add(hero);
  const hc = new THREE.MeshStandardMaterial({ color: 0xf0a020, roughness: 0.35, metalness: 0.4 });
  const trailer = box(0.92, 0.3, 0.25, hc, -0.08, 0.24, 0, hero);
  const cabM = new THREE.MeshStandardMaterial({ color: 0xececec, roughness: 0.28, metalness: 0.3 });
  box(0.22, 0.24, 0.25, cabM, 0.52, 0.2, 0, hero);
  box(0.02, 0.1, 0.22, new THREE.MeshStandardMaterial({ color: 0x151b22, roughness: 0.1, metalness: 0.5 }), 0.635, 0.24, 0, hero);
  box(1.14, 0.03, 0.2, new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: 0.7 }), 0.03, 0.072, 0, hero);
  for (let i = 0; i < 9; i++) box(0.012, 0.28, 0.255, new THREE.MeshStandardMaterial({ color: 0xc8821a, roughness: 0.4 }), -0.5 + i * 0.105, 0.24, 0, hero);
  const wheelG = new THREE.CylinderGeometry(0.04, 0.04, 0.27, 16); wheelG.rotateX(Math.PI / 2);
  const wheelM = new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.8 });
  [-0.46, -0.36, 0.1, 0.52].forEach((x) => { const w = new THREE.Mesh(wheelG, wheelM); w.position.set(x, 0.042, 0); w.castShadow = true; hero.add(w); });
  hero.position.set(0, DY, -0.42);
  // Seabed cut face behind the piles for the underwater chapter.
  const earth = new THREE.Mesh(new THREE.BoxGeometry(400, 30, 80), new THREE.MeshStandardMaterial({ map: canvasTex(1024, 1024, (c, w, h) => {
    const R = mulberry(19); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#4d4031"); g.addColorStop(0.3, "#6a5a43"); g.addColorStop(1, "#201913"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 16000; i++) { c.fillStyle = R() > 0.5 ? "#000" : "#a89478"; c.globalAlpha = 0.04 + R() * 0.1; const q = 1 + R() * 7; c.fillRect(R() * w, R() * h, q, q); } c.globalAlpha = 1;
  }, [4, 1]), roughness: 1 }));
  earth.position.set(0, -19, -43); A.add(earth);
  const bedTop = new THREE.Mesh(new THREE.BoxGeometry(400, 30, 60), earth.material); bedTop.position.set(0, -19, 34); bedTop.visible = true; A.add(bedTop);
  bedTop.position.z = 31 + 3.2;
  // Instanced force arrows, colour per instance.
  const NA = 40;
  const arrowG = new THREE.ConeGeometry(0.14, 0.42, 12); arrowG.translate(0, -0.21, 0);
  const arrows = new THREE.InstancedMesh(arrowG, new THREE.MeshBasicMaterial({ color: 0xffffff }), NA);
  arrows.frustumCulled = false; A.add(arrows);
  for (let i = 0; i < NA; i++) arrows.setColorAt(i, C_COMP);

  // ========= blueprint table =========
  const T = new THREE.Scene();
  T.environment = env; T.environmentIntensity = 0.42;
  T.background = new THREE.Color(0x071726);
  const tex = canvasTex(2048, 2048, (c, w) => {
    c.fillStyle = "#0d2c4b"; c.fillRect(0, 0, w, w);
    c.strokeStyle = "rgba(190,226,255,.13)"; c.lineWidth = 1;
    for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
    c.strokeStyle = "rgba(190,226,255,.28)"; c.lineWidth = 2;
    for (let i = 0; i <= w; i += 160) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
  }, [14, 8]);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(260, 150), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
  table.rotation.x = -Math.PI / 2; table.position.set(50, 0, 0); table.receiveShadow = true; T.add(table);
  const key = new THREE.DirectionalLight(0xfff0dc, 3.2); key.position.set(30, 40, 24); key.target.position.set(40, 0, 0); T.add(key, key.target);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); Object.assign(key.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 1, far: 150 }); key.shadow.normalBias = 0.03;
  const rim = new THREE.DirectionalLight(0x8fc4ff, 1.1); rim.position.set(-20, 10, -30); T.add(rim);
  const compM = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, roughness: 0.42, metalness: 0.6, emissive: hexComp, emissiveIntensity: 0 });
  const tensM = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, roughness: 0.42, metalness: 0.6, emissive: hexTens, emissiveIntensity: 0 });
  const neutM = new THREE.MeshStandardMaterial({ color: 0xaeb2b6, roughness: 0.6, metalness: 0.35 });
  const concT = new THREE.MeshStandardMaterial({ color: 0xbfb9ae, roughness: 0.85 });
  // Arrows on the table are also instanced.
  const tArrows = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.75, 12).translate(0, -0.375, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), 30);
  tArrows.frustumCulled = false; T.add(tArrows);
  for (let i = 0; i < 30; i++) tArrows.setColorAt(i, C_COMP);

  // Beam under load, exploded then bent. Stress is drawn by the shader: compression on top, tension at the bottom.
  const BU = { uBend: { value: 0 }, uStress: { value: 0 }, uLift: { value: 0 } };
  const beamMat = (base, lift) => new THREE.ShaderMaterial({
    uniforms: { uBend: BU.uBend, uStress: BU.uStress, base: { value: new THREE.Color(base) }, uY: { value: lift } },
    vertexShader: `uniform float uBend,uY;varying vec3 vN;varying float vH;void main(){vec3 p=position;vH=p.y+uY;float k=p.x/6.;float w=-uBend*(1.-k*k);p.y+=w;p.y+=uY;p.x+=(position.y+uY)*uBend*.32*k*.4;
      vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `uniform vec3 base;uniform float uStress;varying vec3 vN;varying float vH;void main(){float l=.42+.58*max(dot(vN,normalize(vec3(.3,.8,.5))),0.);vec3 c=base*l;
      float s=clamp(vH/.8,-1.,1.);vec3 tint=s>0.?vec3(1.2,.36,.07):vec3(.14,.48,1.2);c=mix(c,tint*(.45+.55*l),abs(s)*uStress);gl_FragColor=vec4(c,1.);}`,
  });
  const beamG = new THREE.Group(); beamG.position.set(-20, 2.4, 0); T.add(beamG);
  const layers = [
    { h: 0.14, y: 0.59, c: 0x2c2d30, u: new THREE.BoxGeometry(12, 0.14, 3.2, 80, 1, 2), up: 2.5 },
    { h: 0.32, y: 0.36, c: 0xb8b2a7, u: new THREE.BoxGeometry(12, 0.32, 3.2, 80, 1, 2), up: 1.2 },
    { h: 0.9, y: -0.25, c: 0x8d9095, u: new THREE.BoxGeometry(12, 0.9, 2.1, 80, 4, 2), up: 0 },
  ].map((l) => { const m = beamMat(l.c, l.y); const mesh = new THREE.Mesh(l.u, m); mesh.frustumCulled = false; beamG.add(mesh); return { ...l, mesh, m }; });
  box(0.8, 1.9, 2.4, concT, -5.7, -1.8, 0, beamG); box(0.8, 1.9, 2.4, concT, 5.7, -1.8, 0, beamG);
  // Model bridges, spaced along x so the camera pans through a design history.
  const G = {};
  const addModel = (name, x) => { const g = new THREE.Group(); g.position.x = x; T.add(g); G[name] = g; return g; };
  { // beam bridge
    const g = addModel("beam", 2);
    box(12, 0.5, 2.2, concT, 0, 3, 0, g).castShadow = true;
    [-5.6, 5.6].forEach((x) => box(0.9, 2.8, 1.8, concT, x, 1.4, 0, g));
  }
  { // truss bridge
    const g = addModel("truss", 20);
    box(12, 0.2, 2.2, concT, 0, 2.4, 0, g);
    [-5.6, 5.6].forEach((x) => box(0.9, 2.3, 1.8, concT, x, 1.15, 0, g));
    [-1.05, 1.05].forEach((z) => {
      const n = 6, W = 12 / n, top = 4.7, bot = 2.55;
      for (let i = 0; i < n; i++) member(v3(-6 + i * W, bot, z), v3(-6 + (i + 1) * W, bot, z), 0.09, tensM, g);
      for (let i = 0; i < n - 1; i++) member(v3(-6 + (i + 0.5) * W + 0, top, z), v3(-6 + (i + 1.5) * W, top, z), 0.1, compM, g);
      for (let i = 0; i < n; i++) {
        const mid = v3(-6 + (i + 0.5) * W, top, z);
        member(v3(-6 + i * W, bot, z), mid, 0.07, i < n / 2 ? compM : tensM, g);
        member(mid, v3(-6 + (i + 1) * W, bot, z), 0.07, i < n / 2 ? tensM : compM, g);
      }
    });
  }
  { // arch bridge
    const g = addModel("arch", 38);
    box(13, 0.26, 2.2, concT, 0, 4.2, 0, g);
    [-1, 1].forEach((z) => {
      let last = null;
      for (let i = 0; i <= 28; i++) {
        const u = i / 28, x = -6.3 + 12.6 * u, y = 0.5 + 3.5 * (1 - (2 * u - 1) ** 2);
        const p = v3(x, y, z * 0.72);
        if (last) member(last, p, 0.17, compM, g);
        last = p;
        if (i % 4 === 0 && i > 0 && i < 28) member(p, v3(x, 4.1, z * 0.72), 0.045, neutM, g);
      }
    });
    [-6.9, 6.9].forEach((x) => box(1.6, 1.3, 2.8, concT, x, 0.65, 0, g));
  }
  { // suspension bridge
    const g = addModel("susp", 56);
    box(15, 0.18, 1.5, neutM, 0, 2.2, 0, g);
    [-4.6, 4.6].forEach((x) => [-0.72, 0.72].forEach((z) => member(v3(x, 0, z), v3(x, 6.3, z), 0.16, compM, g)));
    [-4.6, 4.6].forEach((x) => box(0.26, 0.26, 1.6, neutM, x, 6.2, 0, g));
    [-0.72, 0.72].forEach((z) => {
      const parab = (x) => 2.8 + (3.5 * (x / 4.6) ** 2);
      let last = v3(-8.6, 0.5, z);
      for (let x = -4.6; x <= 4.61; x += 0.46) { const p = v3(x, parab(x), z); member(last, p, 0.045, tensM, g); last = p; member(p, v3(x, 2.25, z), 0.016, tensM, g); }
      member(last, v3(8.6, 0.5, z), 0.045, tensM, g);
    });
    [-8.6, 8.6].forEach((x) => box(1.1, 0.8, 2.2, concT, x, 0.4, 0, g));
  }
  { // cable-stayed
    const g = addModel("stay", 74);
    box(15, 0.18, 1.5, neutM, 0, 2.2, 0, g);
    [-0.72, 0.72].forEach((z) => {
      member(v3(0, 0, z * 1.4), v3(0, 7.2, z * 0.4), 0.2, compM, g);
      for (let i = 1; i <= 7; i++) [-1, 1].forEach((s0) => member(v3(0, 3.6 + i * 0.48, z * 0.4), v3(s0 * i * 1, 2.25, z), 0.022, tensM, g));
    });
  }
  // expansion joint rig
  const J = new THREE.Group(); J.position.set(94, 0, 0); T.add(J);
  const jm = new THREE.MeshStandardMaterial({ color: 0x95999e, roughness: 0.38, metalness: 0.75 });
  const asph = new THREE.MeshStandardMaterial({ color: 0x25262a, roughness: 0.94 });
  const lDeck = new THREE.Group(), rDeck = new THREE.Group(); J.add(lDeck, rDeck); lDeck.position.y = rDeck.position.y = 0.38;
  box(9, 0.9, 4.5, concT, -5.1, 2.5, 0, lDeck); box(9, 0.14, 4.5, asph, -5.1, 3.02, 0, lDeck);
  box(9, 0.9, 4.5, concT, 5.1, 2.5, 0, rDeck); box(9, 0.14, 4.5, asph, 5.1, 3.02, 0, rDeck);
  for (let i = 0; i < 9; i++) {
    const z = -2 + i * 0.5;
    box(1.2, 0.09, 0.2, jm, -0.3, 3.06, z, lDeck);
    box(1.2, 0.09, 0.2, jm, 0.3, 3.06, z + 0.25, rDeck);
  }
  box(0.3, 0.09, 4.5, jm, -0.75, 3.06, 0, lDeck); box(0.3, 0.09, 4.5, jm, 0.75, 3.06, 0, rDeck);
  box(2.2, 2.1, 3.4, concT, 3.2, 1.05, 0, J); // pier
  const pad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.34, 2.6, 8, 4, 2), new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.6, emissive: 0x101114 })); pad.position.set(3.2, 2.27, 0);
  const padLamp = new THREE.PointLight(0xfff0dc, 4, 12, 1.4); padLamp.position.set(3.2, 2.2, 4.5); J.add(padLamp);
  const padTag = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.42), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(512, 102, (c, w, h) => { c.fillStyle = "rgba(7,23,38,.85)"; c.fillRect(0, 0, w, h); c.font = "800 66px Roboto,Arial"; c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("BANTALAN", w / 2, h / 2 + 3); }) }));
  padTag.position.set(3.2, 1.62, 1.8); J.add(padTag); pad.castShadow = true; J.add(pad);
  const padBase = Float32Array.from(pad.geometry.attributes.position.array);

  const composer = (scn, st) => {
    const c = new EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 }));
    c.setSize(1080, 1920);
    c.addPass(new RenderPass(scn, cam));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), st, 0.45, 1.2));
    c.addPass(new OutputPass());
    return c;
  };
  const cA = composer(A, 0.22), cT = composer(T, 0.18);

  const s = K;
  const E = {
    mati: AT["s2:mati"], hidup: AT["s2:hidup"], tekan: AT["s3:Tekan"], tarik: AT["s3:Tarik"], lengkung: AT["s3:melengkung"], balok: AT["s4:Balok"], rangka: AT["s4:Rangka"], lengk: AT["s4:Lengkung"],
    gantung: AT["s5:gantung"], tetap: AT["s5:kabel-tetap"], sura: AT["s5:Suramadu"], truk: AT["s6:truk"], dek: AT["s6:dek"], kabel: AT["s6:Kabel"], pilon: AT["s6:Pilon"], fondasi: AT["s6:fondasi"], tanah: AT["s6:tanah"],
    panas: AT["s7:Panas"], dingin: AT["s7:dingin"], bantalan: AT["s7:Bantalan"], meter: AT["s7:meter"],
  };
  const camHero = track([
    [0, 50, 0.8, 44, 21.7, 7.2, 0],
    [s.s2 - 0.1, 40, 1.4, 33, 21.7, 7, 0],
    [s.s2 + 3, 9, 4.1, 8, 2, 3.7, 0],
    [E.mati + 1.5, -1, 5.3, 9, 4, 4.5, 0],
    [E.hidup + 2, 5, 4.3, 3.6, 1.5, 3.65, 0],
    [s.s3, 7, 4.2, 3, 2, 3.6, 0],
  ]);
  const camTable = track([
    [s.s3 - 0.01, -20, 6.5, 32, -20, 3.6, 0],
    [E.tekan, -20, 6, 29, -20, 3.4, 0],
    [s.s3e, -19, 5.5, 26, -20, 3.2, 0],
    [s.s4 + 0.3, -6, 9, 34, 0, 4, 0],
    [E.balok + 1.4, 2, 9, 34, 2, 3.2, 0],
    [E.rangka + 0.3, 14, 9, 35, 20, 3.6, 0],
    [E.rangka + 2.4, 20, 9, 34, 20, 3.6, 0],
    [E.lengk + 0.2, 33, 9, 35, 38, 3.4, 0],
    [s.s4e, 38, 9, 36, 38, 3.4, 0],
    [s.s5 + 0.4, 50, 9.5, 38, 54, 3.8, 0],
    [E.gantung + 1.5, 56, 9.5, 38, 56, 3.8, 0],
    [E.tetap - 0.6, 66, 9.5, 38, 72, 3.8, 0],
    [E.tetap + 1.5, 74, 9, 36, 74, 3.8, 0],
    [E.sura, 75, 8.5, 33, 74, 3.8, 0],
  ]);
  const camSura = track([
    [E.sura - 0.01, 50, 2.2, 36, 21.7, 7, 0],
    [s.s6, 40, 3, 28, 21.7, 6.8, 0],
  ]);
  const cam6 = track([
    [s.s6, -8.5, 4.05, 3.2, -3.4, 3.8, -0.4],
    [E.dek, -3.5, 3.72, 2.2, 0, 3.72, -0.4],
    [E.kabel, 1.5, 5.3, 6.6, 5, 5.8, 0],
    [E.pilon - 0.3, 11, 11, 12, 21.7, 11.6, 0],
    [E.fondasi - 0.5, 13, 5, 16, 21.7, 3.4, 0],
    [E.fondasi + 0.6, 15, -1.3, 15, 21.7, -3, 0],
    [E.tanah, 15.5, -5.2, 16, 21.7, -7.2, 0],
    [s.s6e, 15.5, -6.4, 17, 21.7, -8, 0],
  ]);
  const camJ = track([
    [s.s7, 91, 10, 10, 94, 3.1, 0],
    [E.panas + 1.2, 92.6, 9.2, 8.2, 94, 3, 0],
    [E.bantalan - 0.1, 94, 8.6, 7.6, 94.2, 3, 0],
    [E.bantalan + 0.9, 97.6, 2.9, 12.5, 97.2, 2.3, 0],
    [s.s7e, 97.9, 2.7, 10.8, 97.2, 2.25, 0],
  ]);
  const camEnd = track([
    [s.s8, 52, 3, 42, 21.7, 7.4, 0],
    [s.end + 3, 62, 6.5, 56, 21.7, 7, 0],
  ]);
  const camera = (c) => { cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); };
  const col = new THREE.Color();
  function setArrow(mesh, i, p, dir, sc, color) {
    dm.position.copy(p); dm.quaternion.setFromUnitVectors(UP, dir); dm.scale.setScalar(sc); dm.updateMatrix();
    mesh.setMatrixAt(i, dm.matrix); mesh.setColorAt(i, color);
  }
  const hide = (mesh, n) => { dm.scale.setScalar(0); dm.position.set(0, -500, 0); dm.updateMatrix(); for (let i = n; i < mesh.count; i++) mesh.setMatrixAt(i, dm.matrix); };
  const flip = (d) => d.clone().negate();

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const onTable = (t >= s.s3 && t < E.sura) || (t >= s.s7 && t < s.s8);
    WU.uTime.value = t; sky.material.uniforms.uT.value = t;
    if (onTable) {
      if (t < E.sura) camera(camTable(t)); else camera(camJ(t));
      // ---- exploded deck, then load and stress on the same beam ----
      const open = ramp(t, s.s3 + 0.1, s.s3 + 1.4) * (1 - ramp(t, E.tekan - 0.9, E.tekan - 0.1));
      layers.forEach((l) => { l.mesh.position.y = l.up * open; });
      const load = ramp(t, E.tekan - 0.2, E.lengkung + 0.5);
      BU.uBend.value = load * 0.5;
      BU.uStress.value = ramp(t, E.tekan, E.tarik + 0.5);
      let n = 0;
      if (t < s.s4 && t > E.tekan - 0.3) {
        const a1 = ramp(t, E.tekan, E.tekan + 0.3), a2 = ramp(t, E.tarik, E.tarik + 0.3);
        for (let i = -1; i <= 1; i += 2) {
          setArrow(tArrows, n++, v3(-20 + i * 2.4, 3.6 + BU.uBend.value * -0.5, 1.8), v3(-i, 0, 0), a1 * 1.15, C_COMP);
          setArrow(tArrows, n++, v3(-20 + i * 3, 1.3 + BU.uBend.value * -0.5, 1.5), v3(i, 0, 0), a2 * 1.15, C_TENS);
        }
        for (let i = -3; i <= 3; i++) setArrow(tArrows, n++, v3(-20 + i * 1.6, 6.4 + 0.2 * Math.sin(t * 2 + i), 0), v3(0, -1, 0), load * 0.8, new THREE.Color(1.05, 1.05, 1.05));
      }
      // reactions for each small model as it is named
      const beamOn = ramp(t, E.balok, E.balok + 0.3) * (1 - ramp(t, E.rangka, E.rangka + 0.3));
      if (beamOn > 0.01) { for (let i = -1; i <= 1; i++) setArrow(tArrows, n++, v3(2 + i * 2.2, 5.1 + ((t * 1.2 + i * 0.3) % 1) * 0.5, 0), v3(0, -1, 0), beamOn * 1.4, C_COMP); [-5.6, 5.6].forEach((x) => setArrow(tArrows, n++, v3(2 + x, 1.4, 1.5), v3(0, -1, 0), beamOn * 1.4, C_COMP)); }
      const archOn = ramp(t, E.lengk, E.lengk + 0.4) * (1 - ramp(t, s.s4e, s.s5 + 0.3));
      if (archOn > 0.01) { setArrow(tArrows, n++, v3(38 - 6.4, 1.0, 1.7), v3(-0.82, -0.57, 0).normalize(), archOn * 2, C_COMP); setArrow(tArrows, n++, v3(38 + 6.4, 1.0, 1.7), v3(0.82, -0.57, 0).normalize(), archOn * 2, C_COMP); }
      hide(tArrows, n);
      tArrows.instanceMatrix.needsUpdate = true;
      if (tArrows.instanceColor) tArrows.instanceColor.needsUpdate = true;
      const pulse = 0.55 + 0.45 * Math.sin(t * 4);
      compM.emissiveIntensity = (ramp(t, E.rangka, E.rangka + 0.5)) * (0.75 + 0.45 * pulse);
      tensM.emissiveIntensity = compM.emissiveIntensity;
      // thermal cycle: day pushes the deck into the gap, night pulls it open. Movement exaggerated, labelled on screen.
      const dayN = t < E.dingin ? ramp(t, s.s7, E.panas + 0.4) : 1 - 2 * ramp(t, E.dingin - 0.2, E.dingin + 1.0);
      const cyc = t > E.bantalan ? Math.sin((t - E.bantalan) * 1.6) * 0.7 + 0.1 : dayN;
      const mv = cyc * 0.38;
      lDeck.position.x = mv * 0.5; rDeck.position.x = -mv * 0.5;
      const shear = -mv * 0.75;
      const pp = pad.geometry.attributes.position, ar = pp.array;
      for (let i = 0; i < pp.count; i++) ar[i * 3] = padBase[i * 3] + (padBase[i * 3 + 1] / 0.34 + 0.5) * shear;
      pp.needsUpdate = true;
      key.color.setRGB(1, 0.93 - Math.max(0, -cyc) * 0.1, 0.84 + Math.max(0, -cyc) * 0.16);
      key.intensity = 3.2 - Math.max(0, -cyc) * 1.5;
      cT.render();
      return;
    }
    // ---- hero bridge ----
    if (t < s.s3) camera(camHero(t));
    else if (t < s.s6) camera(camSura(t));
    else if (t < s.s8) camera(cam6(t));
    else camera(camEnd(t));
    cam.updateMatrixWorld();
    WU.uCam.value.copy(cam.position);
    const under = cam.position.y < 0;
    A.background = under ? new THREE.Color(0x0c3a42) : null;
    sky.visible = !under;
    A.fog = under ? new THREE.FogExp2(0x0c3a42, 0.035) : null;
    // traffic
    for (let i = 0; i < NV; i++) {
      const v = vs[i];
      const span = 260;
      const x = ((v.off * span + t * v.speed * v.dir) % span + span * 1.5) % span - span / 2;
      const yaw = v.dir > 0 ? 0 : Math.PI;
      dm.rotation.set(0, yaw, 0);
      const L = v.truck ? 1.0 : 0.45;
      dm.position.set(x, DY + (v.truck ? 0.2 : 0.085), v.z);
      dm.scale.set(L, v.truck ? 0.34 : 0.14, v.truck ? 0.24 : 0.18); dm.updateMatrix(); body.setMatrixAt(i, dm.matrix);
      dm.position.set(x + v.dir * L * 0.25, DY + (v.truck ? 0.3 : 0.128), v.z);
      dm.scale.set(v.truck ? L * 0.08 : L * 0.3, v.truck ? 0.1 : 0.048, v.truck ? 0.245 : 0.184); dm.updateMatrix(); cab.setMatrixAt(i, dm.matrix);
      dm.position.set(x + v.dir * L * 0.5, DY + 0.08, v.z); dm.scale.setScalar(1); dm.updateMatrix(); lights.setMatrixAt(i, dm.matrix);
    }
    body.instanceMatrix.needsUpdate = cab.instanceMatrix.needsUpdate = lights.instanceMatrix.needsUpdate = true;
    // Featured truck rolls toward the tower during the load chapter.
    const hx = t >= s.s6 ? -4 + (t - s.s6) * 1.4 : -6 + t * 0.6;
    hero.position.x = Math.min(hx, 18);
    hero.visible = t >= s.s2;
    // ---- load path staging ----
    const truckOn = t >= s.s6 && t < s.s8;
    const kabelOn = truckOn ? ramp(t, E.kabel, E.kabel + 0.4) : 0;
    const allGlow = t >= s.s8 ? ramp(t, s.s8 + 0.8, s.s8 + 2.2) : t >= s.s6 ? kabelOn : 0;
    for (let i = 0; i < stays.length; i++) {
      const c = stays[i];
      let v = 0;
      if (truckOn) { const dx = Math.abs(c.b.x - hero.position.x); v = kabelOn * Math.exp(-((dx / 5.5) ** 2)) * 0.34 + kabelOn * 0.03; }
      if (t >= s.s8) v = allGlow * 0.24 * (0.7 + 0.3 * Math.sin(t * 2 - c.u * 6));
      if (t >= E.hidup - 0.1 && t < s.s3) v = 0;
      col.copy(C_TENS).multiplyScalar(v);
      stayGlow.setColorAt(i, col);
    }
    stayGlow.instanceColor.needsUpdate = true;
    const bandStart = E.pilon, bandEnd = E.tanah + 0.4;
    const by = truckOn ? THREE.MathUtils.lerp(H, -13, clamp01((t - bandStart) / (bandEnd - bandStart))) : -100;
    PU.uBand.value = by;
    PU.uGlow.value = truckOn && t >= bandStart ? 1 : 0;
    PU.uAll.value = truckOn ? (t >= bandStart ? 1 : 0) : t >= s.s8 ? allGlow * 0.9 : t >= E.mati && t < E.hidup ? 1.4 : 0;
    if (t >= E.mati && t < E.hidup) PU.uBand.value = -20;
    if (t >= s.s8) PU.uBand.value = -20;
    let n = 0;
    if (t >= E.hidup && t < s.s3) {
      for (let i = 0; i < NV && n < 14; i++) {
        const v = vs[i];
        if (!v.truck) continue;
        const x = ((v.off * 260 + t * v.speed * v.dir) % 260 + 390) % 260 - 130;
        setArrow(arrows, n++, v3(x, DY + 0.95 + 0.06 * Math.sin(t * 5 + i), v.z), v3(0, -1, 0), ramp(t, E.hidup, E.hidup + 0.5) * 1.1, new THREE.Color(2.4, 2.4, 2.4));
      }
      setArrow(arrows, n++, v3(hero.position.x, DY + 1.05, hero.position.z), v3(0, -1, 0), 1.4, C_COMP);
    }
    if (truckOn) {
      setArrow(arrows, n++, v3(hero.position.x, DY + 0.95 + 0.04 * Math.sin(t * 6), hero.position.z), v3(0, -1, 0), ramp(t, E.truk, E.truk + 0.3) * 0.55, C_COMP);
      if (t > E.dek) setArrow(arrows, n++, v3(hero.position.x, DY - 0.42, hero.position.z), v3(0, -1, 0), ramp(t, E.dek, E.dek + 0.3) * 0.5, C_COMP);
      // Each active stay pulls the deck upward at its anchor.
      if (kabelOn > 0.01) for (let i = 0; i < stays.length && n < 34; i++) {
        const c = stays[i];
        if (Math.abs(c.b.x - hero.position.x) > 3.2) continue;
        setArrow(arrows, n++, c.b.clone().add(v3(0, 0.34, 0)), c.a.clone().sub(c.b).normalize(), kabelOn * 0.7, C_TENS);
      }
      if (t > E.fondasi) for (let j = 0; j < 6; j++) setArrow(arrows, n++, v3(21.7 - 1.25 + j * 0.5, -6 - ((t * 1.2 + j * 0.3) % 1) * 3.5, 3), v3(0, -1, 0), ramp(t, E.fondasi, E.fondasi + 0.5) * 1.5, C_COMP);
    }
    hide(arrows, n);
    arrows.instanceMatrix.needsUpdate = true;
    if (arrows.instanceColor) arrows.instanceColor.needsUpdate = true;
    earth.visible = bedTop.visible = under || (t >= E.fondasi - 1);
    bedTop.visible = false;
    cA.render();
  };
}
