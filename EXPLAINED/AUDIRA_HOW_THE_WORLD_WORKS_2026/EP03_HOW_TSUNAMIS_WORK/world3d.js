// EP03 THE COLUMN. Open ocean, then down to a subduction fault, then a travelling section where the wave obeys the shallow-water law.
// Speed follows c = sqrt(g h), height follows Green's law H ~ h^(-1/4). Vertical scale is exaggerated and labelled on screen. No wave here is decorative.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, track, volumeNoise, noiseGLSL, skyEnv, canvasTex } from "./lib3d.js";

const OCEAN_FS = `
precision highp float;
varying vec3 vW; varying float vFoam;
uniform vec3 uCam, uSun; uniform float uTime, uStorm;
${noiseGLSL}
float hN(vec2 p,float t){return nA(vec3(p*.008,t*.012))*2.2+nC(vec3(p*.031+t*.006,t*.02))*.75+nB(vec3(p*.15-t*.018,t*.05))*.18+nB(vec3(p*.62+t*.03,t*.09))*.045;}
void main(){
  vec2 p=vW.xz;
  float e=.6;
  float a=hN(p,uTime),bx=hN(p+vec2(e,0.),uTime),bz=hN(p+vec2(0.,e),uTime);
  vec3 n=normalize(vec3(-(bx-a)/e*2.2,1.,-(bz-a)/e*2.2));
  vec3 v=normalize(uCam-vW);
  float f=.02+.98*pow(1.-max(dot(n,v),0.),5.);
  vec3 r=reflect(-v,n); r.y=abs(r.y);
  vec3 sky=mix(vec3(.74,.78,.82),vec3(.1,.27,.56),pow(r.y,.5));
  float sp=pow(max(dot(r,uSun),0.),620.)*40.+pow(max(dot(r,uSun),0.),40.)*.1;
  vec3 deep=vec3(.006,.05,.095), sh=vec3(.02,.2,.25);
  vec3 c=mix(deep,sh,smoothstep(.4,1.,dot(n,uSun))*.6+.25*a*.3);
  c=mix(c,sky,f)+sp*vec3(1.,.93,.82);
  // whitecaps from the sharp noise, more on the wave face
  float foam=smoothstep(.6,.8,nC(vec3(p*.05,uTime*.09)))*smoothstep(.55,.8,nB(vec3(p*.46,uTime*.2)))*.22+vFoam;
  c=mix(c,vec3(.82,.88,.9),clamp(foam,0.,1.));
  float dist=length(uCam-vW);
  c=mix(c,vec3(.68,.73,.78),1.-exp(-dist*.00016));
  gl_FragColor=vec4(c,1.);
}`;

const UNDER_FS = `
precision highp float;
varying vec2 vUv;
uniform vec3 uCam; uniform mat3 uRot; uniform float uTanF,uAspect,uTime,uDepth,uShake;
${noiseGLSL}
void main(){
  vec2 uv=vUv*2.-1.;
  vec3 rd=normalize(uRot*vec3(uv.x*uTanF*uAspect,uv.y*uTanF,-1.));
  float up=rd.y*.5+.5;
  float L=mix(.62,.02,uDepth);
  vec3 c=mix(vec3(.004,.022,.05),vec3(.03,.2,.3)+vec3(.05,.3,.36)*L,pow(up,2.6));
  // god rays exist only near the surface
  vec2 q=rd.xz/max(rd.y,.15);
  float ray=pow(nA(vec3(q*.07,uTime*.03)),3.)*6.*smoothstep(.1,.85,rd.y)*L;
  c+=vec3(.2,.5,.56)*ray;
  gl_FragColor=vec4(c,1.);
}`;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.5, 90000);
  const rnd = mulberry(4600);
  const noise = volumeNoise(64, 53);
  const SUN = new THREE.Vector3(-0.35, 0.42, -0.84).normalize();
  const env = skyEnv(r, 0x4a77b0, 0xcdd8e0, 0x0c2732, SUN, 0xfff0d8, 5);
  const s = K;

  // ==== world A: ocean surface, metres ====
  const A = new THREE.Scene();
  A.environment = env;
  const skyA = new THREE.Mesh(new THREE.SphereGeometry(60000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uNoise: { value: noise }, uS: { value: SUN }, uT: { value: 0 } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;varying vec3 v;uniform sampler3D uNoise;uniform vec3 uS;uniform float uT;void main(){vec3 n=normalize(v);float y=max(n.y,0.);
      vec3 c=mix(vec3(.72,.77,.82),vec3(.09,.27,.58),pow(y,.48));
      float d=max(dot(n,uS),0.);c+=vec3(1.,.9,.72)*(pow(d,1200.)*30.+pow(d,18.)*.28);
      if(n.y>.01){vec2 q=n.xz/(n.y+.1);float a=texture(uNoise,vec3(q*.09+uT*.0006,.2)).r*.65+texture(uNoise,vec3(q*.31,.4)).b*.35;
       float cl=smoothstep(.5,.72,a)*smoothstep(.0,.18,n.y);c=mix(c,vec3(.95,.95,.96),cl*.88);}
      gl_FragColor=vec4(c,1.);}`,
  }));
  A.add(skyA);
  const OU = { uNoise: { value: noise }, uCam: { value: new THREE.Vector3() }, uSun: { value: SUN }, uTime: { value: 0 }, uStorm: { value: 0 } };
  const oceanGeo = new THREE.PlaneGeometry(16000, 16000, 256, 256); oceanGeo.rotateX(-Math.PI / 2);
  const ocean = new THREE.Mesh(oceanGeo, new THREE.ShaderMaterial({
    uniforms: OU, fragmentShader: OCEAN_FS,
    vertexShader: "varying vec3 vW;varying float vFoam;uniform float uTime;void main(){vec3 p=position;p.y+=sin(p.x*.012+uTime*.6)*.9+sin(p.z*.017+uTime*.45)*.8;vW=p;vFoam=0.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}",
  }));
  ocean.frustumCulled = false;
  A.add(ocean);
  // Small cargo ship: gives the swell a scale and pays off the line about ships not feeling it.
  const shipA = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 90), new THREE.MeshStandardMaterial({ color: 0x1f2c35, roughness: 0.5, metalness: 0.4 })); hull.position.y = 3; shipA.add(hull);
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(7, 2, 6, 12), hull.material); bow.scale.z = 2; bow.position.set(0, 3, -45); shipA.add(bow);
  const castle = new THREE.Mesh(new THREE.BoxGeometry(12, 11, 11), new THREE.MeshStandardMaterial({ color: 0xe8e8e2, roughness: 0.5 })); castle.position.set(0, 11.5, 35); shipA.add(castle);
  const palette = [0xc23b22, 0x25668e, 0xc9a227, 0x2e7d4f, 0x8a3324];
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(11, 3, 6), new THREE.MeshStandardMaterial({ color: palette[Math.floor(rnd() * 5)], roughness: 0.7 })); c.position.set(0, 7.5 + (i % 2) * 3, -32 + (i >> 1) * 5); shipA.add(c); }
  shipA.position.set(-6, 0, -230); shipA.rotation.y = 0.5;
  A.add(shipA);

  // ==== world B: seafloor at the fault, kilometres ====
  const B = new THREE.Scene();
  B.environment = env; B.environmentIntensity = 0.55;
  B.fog = new THREE.FogExp2(0x0a3340, 0.009);
  const BU = { uNoise: { value: noise }, uCam: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() }, uTanF: { value: Math.tan((38 * Math.PI) / 360) }, uAspect: { value: 1080 / 1920 }, uTime: { value: 0 }, uDepth: { value: 0 }, uShake: { value: 0 } };
  const bgB = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: BU, depthTest: false, depthWrite: false, fragmentShader: UNDER_FS,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.9999,1.);}",
  }));
  bgB.frustumCulled = false; bgB.renderOrder = -5; B.add(bgB);
  const lamp = new THREE.DirectionalLight(0xd5eef2, 2.8); lamp.position.set(-10, 26, 42); lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048); Object.assign(lamp.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
  lamp.shadow.normalBias = 0.05;
  B.add(lamp);
  // Two plates. The oceanic one (right) dives under the continental one (left), whose locked tip is dragged down and then springs up.
  const plateMat = (a, b, scale) => new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.96,
    map: canvasTex(1024, 1024, (c, w) => {
      const R = mulberry(scale);
      c.fillStyle = a; c.fillRect(0, 0, w, w);
      for (let i = 0; i < 26000; i++) { c.fillStyle = R() > 0.5 ? b : a; c.globalAlpha = 0.03 + R() * 0.13; const q = 1 + R() * 9; c.fillRect(R() * w, R() * w, q, q * (0.5 + R())); }
      c.globalAlpha = 1;
    }, [4, 4]),
  });
  const buildPlate = (w, d, seg, h) => {
    const g = new THREE.PlaneGeometry(w, d, seg, seg); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const uh = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) { const v = h(p.getX(i), p.getZ(i)); p.setY(i, v); uh[i] = v; }
    g.computeVertexNormals();
    return g;
  };
  const bump = (x, z) => Math.sin(x * 0.7 + z * 0.3) * 0.08 + Math.sin(x * 1.9 - z * 1.1) * 0.05 + Math.sin(x * 4.3 + z * 3.1) * 0.02 + Math.sin(z * 6.1 + x * 7.7) * 0.012;
  // continental wedge: surface shallows to the left. Vertex y rewritten each frame for the fault motion.
  const contGeo = buildPlate(40, 40, 220, (x, z) => bump(x, z) + 0);
  contGeo.translate(-20, 0, 0);
  const contBase = Float32Array.from(contGeo.attributes.position.array);
  const cont = new THREE.Mesh(contGeo, plateMat("#3a3a33", "#57524a", 3)); cont.receiveShadow = cont.castShadow = true; B.add(cont);
  const oceanGeoB = buildPlate(40, 40, 120, (x, z) => bump(x + 9, z) - 1.0 - x * 0.0);
  oceanGeoB.translate(20, 0, 0);
  const oceanPlate = new THREE.Mesh(oceanGeoB, plateMat("#26323a", "#3d4a50", 7)); oceanPlate.receiveShadow = true; B.add(oceanPlate);
  // Cut face at the front of the plates so the viewer can see the slab sliding beneath.
  const faceMat = (c1, c2, seed) => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, map: canvasTex(1024, 512, (c, w, h) => {
    const R = mulberry(seed); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(0,0,0,${0.05 + R() * 0.14})`; c.lineWidth = 1 + R() * 3; c.beginPath(); let y = R() * h; c.moveTo(0, y); for (let x = 0; x <= w; x += 50) { y += (R() - 0.5) * 10; c.lineTo(x, y); } c.stroke(); }
  }, [1 / 40, 1 / 16]) });
  const fixFace = (m) => { m.material.map.offset.set(0, 14 / 16); };
  const slabShape = new THREE.Shape();
  slabShape.moveTo(40, -1.3); slabShape.lineTo(1.2, -1.3); slabShape.lineTo(0.4, -1.5); slabShape.lineTo(-30, -7.8); slabShape.lineTo(-30, -14); slabShape.lineTo(40, -14); slabShape.closePath();
  const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(slabShape, { depth: 40, bevelEnabled: false }), faceMat("#6d7b82", "#232d33", 2));
  slab.position.z = -20; B.add(slab); fixFace(slab);
  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(-40, 1.6); wedgeShape.lineTo(0.4, 0); wedgeShape.lineTo(0.4, -1.2); wedgeShape.lineTo(-30, -7.75); wedgeShape.lineTo(-40, -7.75); wedgeShape.closePath();
  const wedge = new THREE.Mesh(new THREE.ExtrudeGeometry(wedgeShape, { depth: 40, bevelEnabled: false }), faceMat("#8d8069", "#3b3127", 5));
  wedge.position.set(0, -0.3, -20); B.add(wedge); fixFace(wedge);
  // Motion arrow on the slab: direction of subduction, moving down-dip.
  const arrowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 0.55, 0.22), transparent: true, opacity: 0, fog: false });
  const arrows = [0, 1, 2].map(() => { const g = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 3), arrowMat); g.rotation.z = Math.PI / 2 + 0.2; B.add(g); return g; });
  const upMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 2.2, 2.3), transparent: true, opacity: 0, fog: false });
  const ups = [0, 1, 2, 3, 4].map(() => { const g = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 3), upMat); B.add(g); return g; });
  // Translucent column so the claim is literal: this body of water, floor to surface, moves.
  const colMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.95, 1.05), transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
  const column = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1), colMat); column.position.set(-0.4, 4.4, 20.2); B.add(column);
  // Column of water: tinted particles lifted by the moving seafloor, so the "whole column moves" claim is visible.
  const NP = 1500;
  const pts = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.95, 1.05), transparent: true, opacity: 0.55, fog: false }), NP);
  pts.frustumCulled = false; B.add(pts);
  const seedP = Array.from({ length: NP }, () => [(rnd() - 0.5) * 18, rnd(), 19.6 + rnd() * 3.5, rnd() * 6.28]);
  // Displacement arrows and surface swell plane.
  const surfU = { a: { value: 0 }, c: { value: 0 }, w: { value: 2.4 }, uTime: { value: 0 } };
  const surfaceB = new THREE.Mesh(new THREE.PlaneGeometry(90, 90, 300, 300), new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: true, uniforms: surfU, depthWrite: false,
    vertexShader: "uniform float a,c,w;varying float h;varying vec2 q;void main(){vec3 p=position;float d=length(p.xy);float k=(d-c)/w;h=a*exp(-k*k)*(1.+d*.0)+a*.35*exp(-k*k*2.);p.z+=h;q=p.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}",
    fragmentShader: "precision highp float;varying float h;varying vec2 q;uniform float uTime;void main(){float s=.5+.5*sin(q.x*1.7+uTime*.8+sin(q.y*.9))*sin(q.y*2.1-uTime*.6+sin(q.x*.7));vec3 c=mix(vec3(.05,.3,.38),vec3(.5,.85,.88),s*.14+smoothstep(0.,1.1,h));float a=.82*(1.-smoothstep(16.,44.,length(q)));gl_FragColor=vec4(c,a);}",
  }));
  surfaceB.rotation.x = -Math.PI / 2; surfaceB.position.y = 9; surfaceB.renderOrder = 3; B.add(surfaceB);
  const crack = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 1.9, 0.5), transparent: true, opacity: 0 }));
  crack.scale.set(1.1, 2.6, 1); crack.position.set(0.25, -0.9, 0.05); B.add(crack);

  // ==== world C: travelling cross-section, 1 unit = 1 km along the track, vertical exaggerated ====
  const C = new THREE.Scene();
  C.background = canvasTex(4, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3c6ea6"); g.addColorStop(0.55, "#9dbdd2"); g.addColorStop(0.72, "#d7dfe0"); g.addColorStop(1, "#d7dfe0"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  C.environment = env; C.environmentIntensity = 0.5;
  // bathymetry over -500..0 km (shore at 0), depth metres
  const depth = (x) => {
    if (x >= 0) return 0;
    const d = -x;
    return 4600 * THREE.MathUtils.smoothstep(d, 3, 200);
  };
  const VS = 1 / 60; // km of world up per metre, depth drawn at this scale
  const waveVS = 1.65; // wave height world units per metre of amplitude
  const X0 = -490;
  // Integrate travel time along the profile so wave position at time tau is exactly c = sqrt(g h).
  const tbl = []; { let x = X0, tau = 0; while (x < 2) { tbl.push([tau, x]); const h = Math.max(depth(x), 8); const c = Math.sqrt(9.8 * h) * 3.6; const dx = 1; tau += dx / c; x += dx; } }
  const xAt = (tau) => { let a = 0, b = tbl.length - 1; if (tau >= tbl[b][0]) return tbl[b][1]; while (b - a > 1) { const m = (a + b) >> 1; if (tbl[m][0] < tau) a = m; else b = m; } return tbl[a][1]; };
  const TOTALH = tbl[tbl.length - 1][0];
  const secW = 520;
  const secU = { uNoise: { value: noise }, uTime: { value: 0 }, uX: { value: X0 }, uA: { value: 0 } };
  const GL_DEPTH = `float depthAt(float x){if(x>=0.)return 0.;float d=-x;float k=clamp((d-3.)/197.,0.,1.);return 4600.*k*k*(3.-2.*k);}`;
  // Green's law for the physics; the on-screen height compresses it so a 50 m crest and a 1 m swell share one frame, labelled as enlarged.
  const greens = (h) => Math.pow(4600 / Math.max(h, 8), 0.25);
  const dispH = (h) => 3.4 + 9 * ramp(greens(h), 1.6, 4.9);
  // Water surface strip + filled column as a single height-driven mesh.
  const NX = 1200;
  const makeStrip = () => {
    const pos = new Float32Array((NX + 1) * 2 * 3), idx = [];
    for (let i = 0; i < NX; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    return g;
  };
  const waterGeo = makeStrip();
  const waterCol = new Float32Array((NX + 1) * 2 * 3); waterGeo.setAttribute("color", new THREE.BufferAttribute(waterCol, 3));
  const water = new THREE.Mesh(waterGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  water.frustumCulled = false; C.add(water);
  const surfLine = new THREE.Mesh(makeStrip(), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 1.05, 1.1), side: THREE.DoubleSide }));
  surfLine.frustumCulled = false; C.add(surfLine);
  // seabed and land
  const bedPos = [], bedIdx = [];
  for (let i = 0; i <= 900; i++) { const x = -500 + (i / 900) * 540; const yy = x >= 0 ? Math.min(14, x * 0.06) + 0.6 * Math.sin(x * 0.7) * Math.min(1, x / 8) * 0.3 : -depth(x) * VS + 0.05 * Math.sin(x * 1.3) + 0.03 * Math.sin(x * 4.9); bedPos.push(x, yy, 0.1, x, -320, 0.1); if (i < 900) { const a = i * 2; bedIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const bedGeo = new THREE.BufferGeometry(); bedGeo.setAttribute("position", new THREE.Float32BufferAttribute(bedPos, 3)); bedGeo.setIndex(bedIdx);
  const bed = new THREE.Mesh(bedGeo, new THREE.ShaderMaterial({
    uniforms: { uNoise: { value: noise } }, side: THREE.DoubleSide,
    vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;varying vec3 vP;uniform sampler3D uNoise;void main(){float n=texture(uNoise,vec3(vP.xy*.02,.3)).r;float m=texture(uNoise,vec3(vP.xy*.13,.7)).b;
      float b=texture(uNoise,vec3(vP.x*.002,vP.y*.05,.3)).r;
      vec3 c=mix(vec3(.05,.04,.033),vec3(.17,.13,.095),smoothstep(.3,.7,b)*.75+m*.25);
      float below=-(vP.y-min(14.,max(vP.x,0.)*.06));
      c*=exp(-max(vP.y+90.,0.)*0.)*mix(.25,.72,exp(-max(below,0.)*.03));
      if(vP.x>0.){c=mix(c,vec3(.09,.15,.06),smoothstep(-1.1,0.,vP.y-min(14.,vP.x*.06)));}
      gl_FragColor=vec4(c,1.);}`,
  }));
  bed.frustumCulled = false; C.add(bed);
  // Coastal town on the land side.
  const town = new THREE.Group(); C.add(town);
  const bM = new THREE.MeshStandardMaterial({ color: 0x9fa6aa, roughness: 0.8 });
  const bM2 = new THREE.MeshStandardMaterial({ color: 0xc78c5c, roughness: 0.85 });
  const NH = 90, houses = [];
  for (let i = 0; i < NH; i++) {
    const w = 0.45 + rnd() * 0.5, h = 0.45 + rnd() * 1.3, x = 0.8 + i * 0.32 + rnd() * 0.2;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5 + rnd() * 2), rnd() > 0.5 ? bM : bM2);
    m.position.set(x, x * 0.06 + h / 2, -0.5 - rnd() * 0.4);
    town.add(m); houses.push({ m, x, y: m.position.y });
  }
  const sun3 = new THREE.DirectionalLight(0xffffff, 2); sun3.position.set(10, 30, 40); C.add(sun3);
  // The sea and coast continue behind the cut face, so the section reads as a slice of a real place.
  const BACKU = { uNoise: { value: noise }, uTime: { value: 0 }, uCx: { value: 0 }, uXw: { value: X0 }, uAmp: { value: 0 }, uL: { value: 40 }, uU: { value: 0 }, uRun: { value: 0 }, uFront: { value: 0 }, uRec: { value: 0 }, uShow: { value: 0 }, uScale: { value: 1 }, uCam: { value: new THREE.Vector3() }, uSun: { value: SUN } };
  const backGeo = new THREE.PlaneGeometry(1800, 2600, 900, 520); backGeo.rotateX(-Math.PI / 2); backGeo.translate(0, 0, -1300);
  const back = new THREE.Mesh(backGeo, new THREE.ShaderMaterial({
    uniforms: BACKU,
    vertexShader: `uniform float uCx,uXw,uAmp,uL,uU,uRun,uFront,uRec,uShow,uTime,uScale;varying vec3 vW;varying float vEta;varying float vLand;varying float vSand;
      float rr(float a,float b,float x){float k=clamp((x-a)/(b-a),0.,1.);return k*k*k*(k*(k*6.-15.)+10.);}
      void main(){vec3 p=position;p.x=p.x*uScale+uCx;float x=p.x;
        float k=(x-uXw)/uL;
        float eta=uAmp*(exp(-k*k*3.)+1.18*exp(-(k+1.5)*(k+1.5)*3.)*rr(.1,.5,uU)+.8*exp(-(k+3.)*(k+3.)*3.)*rr(.2,.7,uU))*uShow*step(x,.1+uRun*40.);
        eta*=1.-rr(0.,.45,uRun)*.8;
        float land=min(14.,max(x,0.)*.06);
        float sea=eta-uRec*2.6+.22*sin(x*2.4+uTime*2.3);
        sea+=5.5*(.5+uRun*.8)*exp(min(x,0.)/18.)*step(.001,uRun);
        float y=x>=0.?land:sea;
        if(x>=0.&&x<uFront) y=land+max(eta,0.)*exp(-x/8.)+5.5*pow(1.-x/max(uFront,.01),.5)*(.5+uRun*.8)*step(.001,uRun);
        vLand=x>=0.&&x>=uFront?1.:0.;
        float dk=clamp((-x-3.)/197.,0.,1.);float bedv=-4600.*dk*dk*(3.-2.*dk)/60.;
        vSand=0.;if(x<0.&&y<bedv){y=bedv;vSand=uRec>.02?1.:0.;}
        p.y=y;vW=p;vEta=eta;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `precision highp float;varying vec3 vW;varying float vEta;varying float vLand;varying float vSand;uniform sampler3D uNoise;uniform float uTime;uniform vec3 uCam,uSun;
      void main(){vec3 v=normalize(uCam-vW);vec2 p=vW.xz;float d=length(uCam-vW);
        float sc=max(1.,d*.012);
        float e=.5*sc;float t=uTime;
        float h0=texture(uNoise,vec3(p*.09/sc,t*.03)).r+texture(uNoise,vec3(p*.3/sc+t*.01,t*.05)).b*.4;
        float hx=texture(uNoise,vec3((p+vec2(e,0.))*.09/sc,t*.03)).r+texture(uNoise,vec3((p+vec2(e,0.))*.3/sc+t*.01,t*.05)).b*.4;
        float hz=texture(uNoise,vec3((p+vec2(0.,e))*.09/sc,t*.03)).r+texture(uNoise,vec3((p+vec2(0.,e))*.3/sc+t*.01,t*.05)).b*.4;
        vec3 n=normalize(vec3(-(hx-h0)/e*sc*.7,1.,-(hz-h0)/e*sc*.7));
        float f=.02+.98*pow(1.-max(dot(n,v),0.),5.);
        vec3 r=reflect(-v,n);r.y=abs(r.y);
        vec3 sky=mix(vec3(.5,.58,.64),vec3(.09,.25,.5),pow(r.y,.5));
        vec3 c=mix(vec3(.008,.07,.11),sky,min(f,.62))+pow(max(dot(r,uSun),0.),300.)*8.*vec3(1.,.94,.84);
        c=mix(c,vec3(.78,.86,.87),smoothstep(.55,1.,vEta*.11)*(.6+.4*h0));
        if(vSand>.5){float q=texture(uNoise,vec3(p*.2,.3)).r;c=mix(vec3(.3,.25,.17),vec3(.5,.43,.3),q);}
        if(vLand>.5||vW.x>0.&&vLand>.5){float q=texture(uNoise,vec3(p*.06,.3)).r;float q2=texture(uNoise,vec3(p*.33,.7)).g;c=mix(vec3(.05,.085,.03),vec3(.15,.19,.075),q*.6+q2*.4);}
        c=mix(c,vec3(.7,.76,.8),1.-exp(-d*.00042));
        gl_FragColor=vec4(c,1.);}`,
  }));
  back.frustumCulled = false; C.add(back);
  // Run-to-high-ground arrows along the slope, only in the warning beat.
  const arrowHill = [0, 1, 2, 3, 4, 5].map((i) => { const g = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.5, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 0.45, 0.14) })); g.rotation.z = -Math.PI / 2 + 0.2; g.position.set(4 + i * 3.4, 2.7 + i * 0.5, 0.8); g.visible = false; C.add(g); return g; });
  // Water parcels: under wind only the top ones move; under a tsunami every depth moves.
  const NDOT = 260;
  const deepDots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.3, 1.3) }), NDOT);
  deepDots.frustumCulled = false; C.add(deepDots);
  const seedD = Array.from({ length: NDOT }, () => [rnd(), 0.02 + rnd() * 0.93]);
  // Foam flecks at the run-up front.
  const NF = 500;
  const foam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.86, 0.92, 0.94) }), NF);
  foam.frustumCulled = false; C.add(foam);
  const seedF = Array.from({ length: NF }, () => [rnd(), rnd(), rnd()]);

  const composer = (scn) => {
    const c = new EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 }));
    c.setSize(1080, 1920);
    c.addPass(new RenderPass(scn, cam));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.26, 0.5, 1.15));
    c.addPass(new OutputPass());
    return c;
  };
  const cA = composer(A), cB = composer(B), cC = composer(C);

  const E = {
    dive: s.s2 + 0.3, lepas: AT["s2:lepas"], gempa: AT["s3:Gempa"], kolom: AT["s3:kolom"], sebar: AT["s3:menyebar"],
    ombak: AT["s4:Ombak"], tsunami: AT["s4:Tsunami"], kecepatan: AT["s5:Kecepatannya"], kapal: AT["s5:Kapal"], dangkal: AT["s6:Mendekati"], melambat: AT["s6:melambat"], meninggi: AT["s6:meninggi"], darat: AT["s7:darat"], sumatra: AT["s7:Sumatra"], seri: AT["s8:berseri"], surut: AT["s8:surut"],
  };
  const camA = track([
    [0, 18, 15, 70, 0, 12, -200],
    [s.s2 - 0.3, 6, 7, 26, 0, -5, -160],
    [E.dive + 0.5, 3, 0.7, 6, 0, -18, -60],
  ]);
  const camB = track([
    [E.dive + 0.4, -0.6, 7, 47, 0, 2.2, 20],
    [E.lepas - 2, -0.2, 1.4, 42, 0, -0.4, 20],
    [E.lepas + 0.8, 0.1, 0.6, 36.5, 0.1, -0.6, 20],
    [E.gempa + 1.5, 0.2, 2.4, 44, 0.1, 1.5, 20],
    [E.kolom + 1.2, 0, 5.6, 58, 0, 3.4, 20],
    [E.sebar - 0.8, 0, 8.5, 72, 0, 4.2, 15],
    [s.s3e, 0, 32, 72, 0, 8.5, -8],
  ]);
  // Section chase: the camera always frames the wave, drifting closer as it shoals.
  const shared = { xw: X0 };
  const rot3 = new THREE.Matrix4();
  const tmpC = new THREE.Color();

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    OU.uTime.value = t; BU.uTime.value = t; surfU.uTime.value = t;
    skyA.material.uniforms.uT.value = t;
    const inB = t >= E.dive + 0.4 && t < s.s4;
    const inC = t >= s.s4;
    const inA2 = t >= E.kapal - 0.1 && t < s.s6;       // back on the surface for the ship line
    let comp;
    if (inA2) {
      const u = (t - E.kapal) / (s.s6 - E.kapal);
      cam.position.set(-120 + u * 25, 16 + u * 2, -75 - u * 25);
      cam.lookAt(25, 4, -240);
      // the tsunami passes under the ship as a 1 m rise over minutes, so the ship barely moves
      shipA.position.y = Math.sin(t * 0.7) * 0.5;
      ocean.position.set(0, 0, 0);
      OU.uCam.value.copy(cam.position);
      comp = cA;
    } else if (!inB && !inC && t < E.dive + 0.4) {
      const c = camA(t);
      cam.position.set(c[0], c[1], c[2]);
      cam.lookAt(c[3], c[4], c[5]);
      OU.uCam.value.copy(cam.position);
      comp = cA;
    } else if (inB) {
      const c = camB(t);
      const quake = ramp(t, E.lepas - 0.05, E.lepas + 0.1) * (1 - ramp(t, E.lepas + 0.4, E.lepas + 3.6));
      cam.position.set(c[0] + Math.sin(t * 61) * quake * 0.1, c[1] + Math.sin(t * 79 + 1) * quake * 0.1, c[2]);
      cam.lookAt(c[3], c[4], c[5]);
      cam.updateMatrixWorld();
      BU.uCam.value.copy(cam.position);
      BU.uRot.value.setFromMatrix4(rot3.extractRotation(cam.matrixWorld));
      BU.uDepth.value = clamp01(1 - (cam.position.y - 1) / 8);
      // elastic rebound: the locked tip is dragged down while strain builds, then springs up in seconds of film time
      const strain = ramp(t, E.dive + 1.8, E.lepas);
      const rel = ramp(t, E.lepas, E.lepas + 0.24);
      const lift = (x) => {
        const k = Math.exp(-((x + 0.1) ** 2) / 6);
        return k * (-0.75 * strain * (1 - rel) + 0.85 * rel);
      };
      const p = contGeo.attributes.position, arr = p.array;
      for (let i = 0; i < p.count; i++) { arr[i * 3 + 1] = contBase[i * 3 + 1] + lift(contBase[i * 3]) - 0.04 * contBase[i * 3]; }
      p.needsUpdate = true; contGeo.computeVertexNormals();
      wedge.position.y = -0.3 + lift(-0.5) * 0.72;
      crack.material.opacity = rel > 0 ? (1 - ramp(t, E.lepas + 0.05, E.lepas + 1.8)) * 1 : 0;
      arrowMat.opacity = ramp(t, AT["s2:lempeng"], AT["s2:lempeng"] + 0.5) * (1 - ramp(t, E.lepas, E.lepas + 0.4));
      arrows.forEach((g, i) => { const u = ((t * 0.32 + i / 3) % 1); g.position.set(5.2 - u * 6.6 - (u > 0.6 ? 0 : 0), -1.55 - Math.max(0, 0.4 - (5.2 - u * 6.6)) * 0.21, 20.25); });
      const colA = ramp(t, E.kolom - 0.5, E.kolom + 0.4) * (1 - ramp(t, E.sebar, E.sebar + 1.2));
      colMat.opacity = colA * 0.15; column.scale.y = 9;
      upMat.opacity = colA; ups.forEach((g) => { g.visible = colA > 0.01; }); column.visible = colA > 0.01; arrows.forEach((g) => { g.visible = arrowMat.opacity > 0.01; });
      ups.forEach((g, i) => { const u = ((t * 0.55 + i / 5) % 1); g.position.set(-0.4 + (i - 2) * 1.1, 0.7 + u * 7.2, 20.5); g.scale.setScalar(Math.sin(u * Math.PI)); });
      // particles carry the lift upward through the whole column, then spread
      const k1 = ramp(t, E.lepas + 0.05, E.kolom + 1.3);
      for (let i = 0; i < NP; i++) {
        const q = seedP[i];
        const y0 = 0.2 + q[1] * 8.7;
        const lx = Math.exp(-(q[0] * q[0]) / 8);
        const up = k1 * lx * 1.2;
        dm.position.set(q[0] + Math.sin(t * 0.3 + q[3]) * 0.06, y0 + up + Math.sin(t * 0.4 + q[3]) * 0.04, q[2]);
        dm.scale.setScalar(1);
        dm.updateMatrix(); pts.setMatrixAt(i, dm.matrix);
      }
      pts.instanceMatrix.needsUpdate = true;
      const rise = ramp(t, E.kolom - 0.3, E.kolom + 1.5);
      const sp = ramp(t, E.sebar - 0.6, s.s3e + 0.2);
      surfU.a.value = 0.9 * rise * (1 - sp * 0.62);
      surfU.c.value = sp * 24;
      surfU.w.value = 2.6 + sp * 2.2;
      comp = cB;
    } else {
      // ---- section phases ----
      // s4: wind wave vs tsunami, s5: deep fast, s6: shoaling, s7: run-up
      const start = E.kecepatan - 0.6;
      const end = E.darat;
      const u = clamp01((t - start) / (end - start));
      const tau = Math.pow(u, 0.86) * TOTALH;
      const xw = t < start ? X0 : xAt(tau);
      shared.xw = xw;
      const h = depth(xw);
      const amp = dispH(h);
      // Wave length shrinks with c: L proportional to sqrt(h), floor keeps the near-shore form legible.
      const c0 = Math.sqrt(9.8 * Math.max(h, 8));
      const L = THREE.MathUtils.clamp(46 * (c0 / 212), 7, 46);
      const showTsu = t >= E.tsunami && t < s.s8;
      const runup = t >= s.s8 ? 0 : ramp(t, E.darat - 0.1, s.s7 + 3);
      // camera window width in km: wide offshore, tight at the coast
      const wide = THREE.MathUtils.lerp(420, 60, ramp(xw, -280, -40));
      const near = t < E.kecepatan - 0.4;
      const last = t >= s.s8;
      const rec = last ? ramp(t, s.s8 + 2.5, E.surut + 0.8) : 0;
      const span = near ? 150 : last ? 62 : wide;
      const cx = near ? X0 + 44 : last ? -4 : Math.min(xw + span * 0.08, 14);
      const coy = -8 + 4 * ramp(xw, -200, -8);
      const coyF = near ? -12 : last ? -3 : coy;
      // Visible width at distance D is D*0.39, so D = span/0.39.
      const visW = near ? 70 : last ? 42 : Math.max(38, span * 0.44);
      const D = visW / 0.39;
      const tgt = near ? -visW * 0.21 : last ? visW * 0.15 : THREE.MathUtils.lerp(-visW * 0.21, visW * 0.15, ramp(xw, -130, -35));
      cam.position.set(cx, tgt + D * 0.17, D);
      cam.lookAt(cx, tgt, 0);
      cam.fov = 38; cam.updateProjectionMatrix();
      // surface in the visible range
      const pos = water.geometry.attributes.position.array, sp = surfLine.geometry.attributes.position.array;
      const x0 = cx - span * 1.2, x1 = cx + span * 1.2;
      for (let i = 0; i <= NX; i++) {
        const x = x0 + ((x1 - x0) * i) / NX;
        // tsunami: a train of long waves. First wave is not the biggest, matching NOAA.
        const k = (x - xw) / L;
        let eta = 0;
        if (showTsu && x < 0.1 + runup * 40) {
          eta = amp * (Math.exp(-k * k * 3) + 1.18 * Math.exp(-((k + 1.5) ** 2) * 3) * ramp(u, 0.1, 0.5) + 0.8 * Math.exp(-((k + 3) ** 2) * 3) * ramp(u, 0.2, 0.7));
          eta *= (t < start ? ramp(t, E.tsunami, E.tsunami + 0.8) : 1) * (1 - ramp(runup, 0, 0.45) * 0.8);
        }
        // wind chop lives only at the surface, its size is fixed and small
        const chop = 0.3 * Math.sin(x * 2.4 + t * 2.3) * (x < 0 ? 1 : 0) + (x < 0 && runup > 0 ? 5.5 * (0.5 + runup * 0.8) * Math.exp(x / 18) : 0);
        let y = chop + eta - (last ? rec * 2.6 : 0);
        const bedHere = x >= 0 ? 0 : -depth(x) * VS;
        if (last && y < bedHere) y = bedHere;
        // run-up: on land the water sheet climbs to the inundation limit
        if (x >= 0) {
          const land = Math.min(14, x * 0.06);
          const front = Math.max(runup * 26, xw + L * 0.5);
          const sheet = x < front && t < s.s8 ? Math.max(0, eta) * Math.exp(-x / 8) + 5.5 * (1 - x / Math.max(front, 0.01)) ** 0.5 * (0.5 + runup * 0.8) + 0.25 * Math.sin(x * 2 + t * 4) * runup : -2;
          y = t >= s.s8 ? land - 2 : land + sheet;
        }
        const bedy = x >= 0 ? Math.min(14, x * 0.06) - 0.1 : -depth(x) * VS;
        const v = i * 6;
        pos[v] = x; pos[v + 1] = y; pos[v + 2] = 0;
        pos[v + 3] = x; pos[v + 4] = bedy; pos[v + 5] = 0;
        // Water moves to its full depth only under a tsunami: tint shows particle motion by depth.
        const mot = clamp01(Math.abs(eta) * 0.25);
        const windOnly = t < E.tsunami ? 1 : 0;
        const top = tmpC.setRGB(0.03 + mot * 0.18, 0.28 + mot * 0.34, 0.42 + mot * 0.33);
        const ci = i * 6;
        waterCol[ci] = top.r; waterCol[ci + 1] = top.g; waterCol[ci + 2] = top.b;
        const dd = showTsu ? 0.4 + mot * 3 : 0.3;
        waterCol[ci + 3] = 0.004 * (1 + dd); waterCol[ci + 4] = 0.04 * (1 + dd); waterCol[ci + 5] = 0.09 * (1 + dd);
        sp[v] = x; sp[v + 1] = y + Math.max(0.05, visW * 0.0028); sp[v + 2] = 0.05;
        sp[v + 3] = x; sp[v + 4] = y - Math.max(0.05, visW * 0.0012); sp[v + 5] = 0.05;
      }
      water.geometry.attributes.position.needsUpdate = true; water.geometry.attributes.color.needsUpdate = true;
      surfLine.geometry.attributes.position.needsUpdate = true;
      Object.assign(BACKU.uCx, { value: cx }); BACKU.uTime.value = t; BACKU.uXw.value = xw; BACKU.uAmp.value = amp * (t < start ? ramp(t, E.tsunami, E.tsunami + 0.8) : 1); BACKU.uL.value = L; BACKU.uU.value = u;
      BACKU.uRun.value = runup; BACKU.uFront.value = t < s.s8 ? Math.max(runup * 26, xw + L * 0.5) : 0; BACKU.uRec.value = rec; BACKU.uShow.value = showTsu ? 1 : 0; BACKU.uCam.value.copy(cam.position); BACKU.uScale.value = Math.max(0.5, visW / 70);
      // Houses are swept only after the sheet reaches them; they tip and drift a little, no gore and no pretence of exact damage.
      const front = t < s.s8 ? runup * 26 : 0;
      for (const b of houses) {
        const hit = clamp01((front - b.x) / 1.8);
        b.m.rotation.z = -hit * 0.55;
        b.m.position.x = b.x + hit * 1.2;
        b.m.position.y = b.y - hit * 0.12;
      }
      town.visible = runup > 0 || xw > -60 || last;
      arrowHill.forEach((g, i) => { const on = last ? ramp(t, E.surut + 0.1 + i * 0.12, E.surut + 0.3 + i * 0.12) : 0; g.visible = on > 0; g.scale.setScalar(on); });
      deepDots.visible = t < E.dangkal;
      if (deepDots.visible) {
        const wnd = 1 - ramp(t, E.tsunami - 0.3, E.tsunami + 0.6);
        for (let i = 0; i < NDOT; i++) {
          const q = seedD[i];
          const zz = q[1];
          const x = cx + (q[0] - 0.5) * span * 1.1;
          const dz = zz * depth(x) * VS;
          const A = wnd * 2.5 * Math.exp(-zz * 7) + (1 - wnd) * 2.4;
          const ph = t * 2.2 + x * 0.3;
          dm.position.set(x + A * Math.sin(ph), -dz + wnd * A * Math.cos(ph) * 0.5, 0.2);
          dm.scale.setScalar(visW * 0.0038);
          dm.updateMatrix(); deepDots.setMatrixAt(i, dm.matrix);
        }
        deepDots.instanceMatrix.needsUpdate = true;
      }
      for (let i = 0; i < NF; i++) {
        const q = seedF[i];
        const fr = front + (q[0] - 1) * 4.5;
        dm.position.set(fr, Math.min(14, Math.max(0, fr) * 0.06) + q[1] * q[1] * 2.8, q[2] * 1.6 - 0.2);
        dm.scale.setScalar(runup > 0.01 && t < s.s8 ? 0.35 + q[2] * 0.9 : 0.001);
        dm.updateMatrix(); foam.setMatrixAt(i, dm.matrix);
      }
      foam.instanceMatrix.needsUpdate = true;
      comp = cC;
    }
    comp.render();
  };

}
const dm = new THREE.Object3D();
