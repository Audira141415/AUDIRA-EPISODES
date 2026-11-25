// EP01 THE ANVIL. Volumetric cumulonimbus raymarched per frame into a half-res HDR buffer, with bolts, ice and rain drawn sharp on top.
// Charge layout follows NOAA NWS: positive anvil, negative middle and lower cloud, small positive pocket at the base. Units are kilometres.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, track, volumeNoise, noiseGLSL, canvasTex } from "./lib3d.js";

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec3 uCam; uniform mat3 uRot; uniform float uTanF, uAspect, uGrow, uTime, uDay, uCharge, uInside;
uniform vec4 uFlash; uniform vec3 uFlashB;
${noiseGLSL}
const vec3 SUN=normalize(vec3(.62,.34,-.7));
float shape(vec3 p){
  float H=mix(3.2,12.6,uGrow), anv=smoothstep(.62,1.,uGrow);
  float y=p.y; if(y<1.6||y>H+1.6) return -1.;
  float h=(y-1.6)/(H-1.6);
  // tower narrows then shears out into the anvil at the tropopause
  float tower=mix(2.2,5.8,smoothstep(0.,.5,uGrow))*(1.-.26*smoothstep(.15,.8,h));
  float anvil=anv*16.*smoothstep(.76,1.,h)*(1.-.45*smoothstep(.97,1.15,h));
  vec2 q=p.xz-vec2(anv*smoothstep(.7,1.,h)*-5.,0.);
  q+=vec2(sin(y*.5+1.3),cos(y*.37))*.9;
  float R=max(tower,anvil);
  return (R-length(q))/max(R,1.)+.32*(1.-smoothstep(.0,.08,h))*0.+(.06-.14*smoothstep(1.,1.12,h));
}
float dens(vec3 p,bool fine){
  float s=shape(p); if(s<-.42) return 0.;
  vec3 w=p+vec3(0.,-uTime*.05,uTime*.02);
  float n=fbm3(w*.027);
  float c=s*1.28+(n-.47)*1.75;
  if(c<=0.) return 0.;
  if(fine){ float dt=nB(w*.13)*.62+nC(w*.33)*.38; c-=(1.-dt)*.3*(1.-clamp(c*2.2,0.,1.)); if(c<=0.) return 0.; }
  c*=smoothstep(1.6,2.,p.y);
  return smoothstep(0.,.13,c);
}
float lightMarch(vec3 p){
  float d=0.,st=.5;
  for(int i=0;i<6;i++){ p+=SUN*st; d+=dens(p,false)*st; st*=1.38; }
  return exp(-d*.85)*.86+exp(-d*.2)*.14;
}
vec3 sky(vec3 rd){
  float y=max(rd.y,0.);
  vec3 dusk=mix(vec3(.05,.058,.082),vec3(.008,.012,.028),pow(y,.45));
  vec3 day=mix(vec3(.5,.56,.64),vec3(.07,.17,.4),pow(y,.5));
  vec3 c=mix(dusk,day,uDay);
  float h=pow(max(dot(rd,SUN),0.),5.);
  c+=vec3(.75,.3,.1)*h*(.3+.3*uDay)*(1.-smoothstep(0.,.22,y));
  return c;
}
void main(){
  vec2 uv=vUv*2.-1.;
  vec3 rd=normalize(uRot*vec3(uv.x*uTanF*uAspect,uv.y*uTanF,-1.));
  vec3 ro=uCam;
  vec3 col=sky(rd);
  float tGround=rd.y<0.?-ro.y/rd.y:1e9;
  vec3 fp=uFlash.xyz; float fI=uFlash.w;
  if(tGround<400.){
    vec3 g=ro+rd*tGround;
    float n=fbm3(vec3(g.xz*.03,.2))*.65+fbm3(vec3(g.xz*.31,.6))*.35;
    vec3 base=mix(vec3(.018,.026,.018),vec3(.05,.058,.035),n);
    float fd=length(g-fp);
    vec3 lit=base*(.22+uDay*2.)+base*fI*9./(1.+fd*fd*.3)*vec3(.72,.82,1.);
    float haze=1.-exp(-tGround*.012);
    col=mix(lit,col,haze);
  }
  // march only between the ground and the storm ceiling
  float tMax=min(tGround,190.);
  float tA=0.;
  if(ro.y>15.5&&rd.y<0.) tA=(15.5-ro.y)/rd.y;
  if(ro.y<1.6&&rd.y>0.) tA=(1.6-ro.y)/rd.y; else if(ro.y<1.6) tMax=-1.;
  if(rd.y>0.&&ro.y<15.5) tMax=min(tMax,(15.5-ro.y)/rd.y);
  vec3 acc=vec3(0.); float T=1.;
  if(tMax>tA){
    float dt=mix(.3,.14,uInside);
    float t=tA+dt*hash12(gl_FragCoord.xy);
    for(int i=0;i<120;i++){
      if(t>tMax||T<.015) break;
      vec3 p=ro+rd*t;
      float d=dens(p,true);
      if(d>.004){
        float L=lightMarch(p);
        float hh=clamp((p.y-1.6)/11.,0.,1.);
        vec3 amb=mix(vec3(.006,.008,.014),vec3(.042,.052,.082),hh)*(1.+uDay*6.);
        vec3 sun=vec3(1.,.8,.66)*L*(.25+uDay*1.05)*mix(.3,1.,smoothstep(.0,.55,hh));
        vec3 c=(amb+sun)*mix(vec3(1.),vec3(.2,.27,.42),uInside);
        float fd=length(p-fp);
        c+=vec3(.62,.76,1.)*fI*.62/(1.+fd*fd*.05);
        // charge layers glow only while the narration explains them
        float a1=smoothstep(8.2,10.,p.y)*(1.-smoothstep(12.5,14.,p.y));
        float a2=smoothstep(3.6,4.8,p.y)*(1.-smoothstep(6.8,8.,p.y));
        float a3=smoothstep(1.6,2.1,p.y)*(1.-smoothstep(2.6,3.2,p.y));
        c+=uCharge*(vec3(.14,.4,1.)*a1*.8+vec3(1.,.16,.1)*a2*.9+vec3(.14,.4,1.)*a3*.45);
        float ab=d*dt*(uInside>.5?.55:3.4);
        float tr=exp(-ab);
        acc+=T*(1.-tr)*c;
        T*=tr;
      }
      t+=dt*(1.+t*.012);
    }
  }
  gl_FragColor=vec4(acc+col*T,1.);
}`;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.01, 500);
  scene.add(cam);
  const rnd = mulberry(30000);

  // ---- volume pass ----
  const vtx = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
  const U = {
    uNoise: { value: volumeNoise(64, 11) }, uCam: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() },
    uTanF: { value: Math.tan((38 * Math.PI) / 360) }, uAspect: { value: 1080 / 1920 }, uGrow: { value: 1 }, uTime: { value: 0 }, uDay: { value: 0 },
    uCharge: { value: 0 }, uInside: { value: 0 }, uFlash: { value: new THREE.Vector4() }, uFlashB: { value: new THREE.Vector3() },
  };
  const volRT = new THREE.WebGLRenderTarget(720, 1280, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const volScene = new THREE.Scene();
  const volCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const volMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: vtx, fragmentShader: FRAG, depthTest: false, depthWrite: false });
  volScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), volMat));
  // Blits the volume behind everything in the sharp scene.
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { t: { value: volRT.texture } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.9999,1.);}",
    fragmentShader: "varying vec2 vUv;uniform sampler2D t;void main(){gl_FragColor=vec4(texture2D(t,vUv).rgb,1.);}", depthTest: false, depthWrite: false,
  }));
  bg.frustumCulled = false; bg.renderOrder = -10; scene.add(bg);

  scene.add(new THREE.HemisphereLight(0x90a8d8, 0x202028, 1.4));
  const camLamp = new THREE.PointLight(0xcfe4ff, 14, 16, 1.6);
  cam.add(camLamp);

  // ---- bolts ----
  function boltPath(start, end, n, spread, seed) {
    const R = mulberry(seed);
    let pts = [start.clone(), end.clone()];
    let amp = spread;
    while (pts.length < n) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const mid = pts[i].clone().lerp(pts[i + 1], 0.42 + R() * 0.16);
        mid.x += (R() - 0.5) * amp; mid.z += (R() - 0.5) * amp; mid.y += (R() - 0.5) * amp * 0.25;
        out.push(mid, pts[i + 1]);
      }
      pts = out; amp *= 0.54;
    }
    return pts;
  }
  const tubeOf = (pts, rad) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), pts.length * 2, rad, 6, false);
  const boltColor = new THREE.Color(0.92, 0.96, 1);
  const boltMat = new THREE.MeshBasicMaterial({ color: boltColor.clone(), toneMapped: true });
  const leaderMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.65, 2.2), transparent: true, opacity: 1 });
  const STRIKE = new THREE.Vector3(-0.75, 0.13, 0.4);
  const TOP = new THREE.Vector3(-0.25, 2.3, 0.2);
  const mainPts = boltPath(TOP, STRIKE, 180, 0.8, 77);
  const bolt = new THREE.Group(); scene.add(bolt);
  const mainGeo = tubeOf(mainPts, 0.0115);
  const mainMesh = new THREE.Mesh(mainGeo, leaderMat); mainMesh.frustumCulled = false; bolt.add(mainMesh);
  const mainFull = mainGeo.index.count;
  const branches = [];
  for (let i = 0; i < 9; i++) {
    const a = 12 + Math.floor((i / 9) * 130) + Math.floor(rnd() * 8);
    const s = mainPts[a];
    const len = 0.28 + rnd() * 0.5;
    const e = s.clone().add(new THREE.Vector3((rnd() - 0.5) * len * 1.6, -len * (0.5 + rnd() * 0.5), (rnd() - 0.5) * len));
    const geo = tubeOf(boltPath(s, e, 28, len * 0.4, 100 + i), 0.0052);
    const m = new THREE.Mesh(geo, leaderMat); m.frustumCulled = false; bolt.add(m);
    branches.push({ m, at: a / mainPts.length, full: geo.index.count });
  }
  // Upward streamer leaves the mast before the leader arrives.
  const MAST = STRIKE.clone();
  const streamPts = boltPath(MAST, mainPts[150].clone(), 26, 0.06, 9);
  const streamGeo = tubeOf(streamPts, 0.0065);
  const streamMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.85, 2.4), transparent: true });
  const streamMesh = new THREE.Mesh(streamGeo, streamMat); streamMesh.frustumCulled = false; scene.add(streamMesh);
  // Two far strokes for the hook, same mechanism, seen from further away.
  const farBolts = [
    { o: new THREE.Vector3(-6.4, 2.0, 7), e: new THREE.Vector3(-8.2, 0, 8.5), s: 21 },
    { o: new THREE.Vector3(5.2, 2.0, 2), e: new THREE.Vector3(7.4, 0, 1), s: 37 },
    { o: new THREE.Vector3(1.7, 2.0, 9.5), e: new THREE.Vector3(0.7, 0, 10), s: 58 },
  ].map((b) => {
    const m = new THREE.Mesh(tubeOf(boltPath(b.o, b.e, 110, 1.3, b.s), 0.021), new THREE.MeshBasicMaterial({ color: new THREE.Color(5.5, 6.2, 8.5), transparent: true }));
    m.frustumCulled = false; m.visible = false; scene.add(m);
    return { m, p: b.o.clone().lerp(b.e, 0.3) };
  });

  // Ground anchors: a lattice mast and low houses give the bolt its scale.
  const gGroup = new THREE.Group(); scene.add(gGroup);
  const steel = new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.6, metalness: 0.7 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.012, 0.13, 6), steel); mast.position.set(STRIKE.x, 0.065, STRIKE.z); gGroup.add(mast);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 0.6, 0.3) })); beacon.position.copy(STRIKE); gGroup.add(beacon);
  const houseGeo = new THREE.BoxGeometry(0.014, 0.008, 0.012);
  const houses = new THREE.InstancedMesh(houseGeo, new THREE.MeshStandardMaterial({ color: 0x1c1d22, roughness: 0.9 }), 240);
  const winGeo = new THREE.PlaneGeometry(0.004, 0.0022);
  const wins = new THREE.InstancedMesh(winGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(3.6, 2.2, 0.85), side: THREE.DoubleSide }), 240);
  const dm = new THREE.Object3D();
  for (let i = 0; i < 240; i++) {
    const a = rnd() * 6.283, d = 0.3 + rnd() * rnd() * 5.5;
    dm.position.set(STRIKE.x + Math.cos(a) * d, 0.004, STRIKE.z - 2 + Math.sin(a) * d);
    dm.rotation.y = rnd() * 3; dm.updateMatrix(); houses.setMatrixAt(i, dm.matrix);
    dm.position.y = 0.0045; dm.position.z -= 0.0065; dm.rotation.y = 0; dm.updateMatrix(); wins.setMatrixAt(i, dm.matrix);
  }
  gGroup.add(houses, wins);

  // ---- ice inside the cloud, parented to the camera so the viewer flies through it ----
  const inside = new THREE.Group(); cam.add(inside);
  const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xf2f8ff, roughness: 0.3, metalness: 0, clearcoat: 1, emissive: 0x7088a0, emissiveIntensity: 0.5 });
  const crystalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 6);
  const graupelGeo = (() => {
    const g = new THREE.IcosahedronGeometry(0.2, 14);
    const R = mulberry(4), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 1 + 0.13 * Math.sin(p.getX(i) * 31 + 1) * Math.sin(p.getY(i) * 37) * Math.sin(p.getZ(i) * 29) + 0.03 * Math.sin(p.getX(i) * 71 + p.getY(i) * 53); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); }
    const q=new THREE.Vector3();for(let i=0;i<p.count;i++){q.set(p.getX(i),p.getY(i),p.getZ(i)).normalize();g.attributes.normal.setXYZ(i,q.x+.14*Math.sin(p.getY(i)*40),q.y+.14*Math.sin(p.getZ(i)*44),q.z+.14*Math.sin(p.getX(i)*38));} return g;
  })();
  const NC = 320, NG = 90;
  const crystals = new THREE.InstancedMesh(crystalGeo, iceMat, NC);
  const graupel = new THREE.InstancedMesh(graupelGeo, new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.8, emissive: 0x3a4048, emissiveIntensity: 0.55 }), NG);
  crystals.frustumCulled = graupel.frustumCulled = false;
  inside.add(crystals, graupel);
  const seedC = Array.from({ length: NC }, () => [rnd(), rnd(), rnd(), rnd() * 6.28, 0.6 + rnd() * 0.9]);
  const seedG = Array.from({ length: NG }, () => [rnd(), rnd(), rnd(), rnd() * 6.28, 0.7 + rnd() * 0.8]);
  const spriteOf = (txt, col, glow) => new THREE.SpriteMaterial({
    map: canvasTex(128, 128, (c, w) => {
      const g = c.createRadialGradient(64, 64, 8, 64, 64, 64); g.addColorStop(0, glow); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w);
      c.fillStyle = col; c.font = "900 92px Inter,Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, 64, 66);
    }), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending,
  });
  const plusM = spriteOf("+", "#9fd8ff", "rgba(50,150,255,.85)"), minusM = spriteOf("−", "#ffb0a0", "rgba(255,60,40,.85)");
  const signsC = [], signsG = [];
  for (let i = 0; i < 46; i++) { const s = new THREE.Sprite(plusM); s.scale.setScalar(0.52); inside.add(s); signsC.push(s); }
  for (let i = 0; i < 34; i++) { const s = new THREE.Sprite(minusM); s.scale.setScalar(0.72); inside.add(s); signsG.push(s); }
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "#fff"); g.addColorStop(0.25, "rgba(160,215,255,.9)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff }));
  spark.scale.setScalar(1.5); inside.add(spark);
  const sparks = Array.from({ length: 16 }, (_, i) => ({ t: (i * 0.618034) % 1, x: (rnd() - 0.5) * 3.4, y: (rnd() - 0.5) * 4.2, z: -3.4 - rnd() * 3 }));

  // World-scale charge markers over the volume once we pull back out.
  const big = new THREE.Group(); scene.add(big);
  const layer = (mat, n, y0, y1, rad, size) => {
    const arr = [];
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(mat.clone()); const a = rnd() * 6.283, q = Math.sqrt(rnd()) * rad; s.position.set(Math.cos(a) * q - 1, y0 + rnd() * (y1 - y0), Math.sin(a) * q * 0.2 - 4); s.scale.setScalar(size * (0.8 + rnd() * 0.4)); big.add(s); arr.push(s); }
    return arr;
  };
  const bigP = layer(plusM, 34, 9.2, 12.2, 9, 1.0), bigN = layer(minusM, 30, 4.1, 7.2, 5, 1.05), bigP2 = layer(plusM, 8, 1.9, 2.8, 3.2, 0.72);
  const groundP = [];
  for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(plusM.clone()); s.position.set(-5.4 + i * 0.72, 0.12, -3 + (i % 3) * 0.7); s.scale.setScalar(0.5); big.add(s); groundP.push(s); }

  // ---- warm rising air during the growth time-lapse ----
  const NW = 150;
  const warmMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.4, 0.5), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const warm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.5, 0.018), warmMat, NW); warm.frustumCulled = false; scene.add(warm);
  const seedW = Array.from({ length: NW }, () => [(rnd() - 0.5) * 9, rnd(), (rnd() - 0.5) * 6 - 2, rnd() * 6]);

  // ---- rain ----
  const NR = 1600;
  const rainMat = new THREE.MeshBasicMaterial({ color: 0xa8c0dd, transparent: true, opacity: 0, depthWrite: false });
  const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.0009, 0.075, 0.0009), rainMat, NR); rain.frustumCulled = false; cam.add(rain);
  const seedR = Array.from({ length: NR }, () => [rnd(), rnd(), rnd(), 0.8 + rnd() * 0.7]);

  // ---- shock around the channel in close-up ----
  const shockMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { a: { value: 0 }, c: { value: new THREE.Color(0.75, 0.88, 1) } },
    vertexShader: "varying vec3 n;varying vec3 v;void main(){vec4 m=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-m.xyz);gl_Position=projectionMatrix*m;}",
    fragmentShader: "varying vec3 n;varying vec3 v;uniform float a;uniform vec3 c;void main(){float f=pow(1.-abs(dot(n,v)),1.6);gl_FragColor=vec4(c*f*a*.32,f*a*.3);}",
  });
  const CHAN = mainPts[70].clone();
  const shocks = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 48, 1, true), shockMat.clone()); m.position.copy(CHAN); m.visible = false; scene.add(m); return m; });
  // plasma core drawn fat for the close-up only
  const coreGeo = tubeOf(boltPath(CHAN.clone().add(new THREE.Vector3(0.06, 0.9, 0)), CHAN.clone().add(new THREE.Vector3(-0.05, -0.9, 0.02)), 90, 0.05, 5), 0.0034);
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4.5, 6), transparent: true, opacity: 0 });
  const core = new THREE.Mesh(coreGeo, coreMat); core.frustumCulled = false; scene.add(core);

  // ---- composer ----
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 }));
  comp.setSize(1080, 1920);
  comp.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(540, 960), 0.55, 0.65, 0.95);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  const s = K;
  const EV = {
    hook1: 0.12, hook2: AT["s1:pelepasan"], lead: AT["s5:Jalur"], stream: AT["s5:Dari"], meet: AT["s6:bertemu"], ret: AT["s6:arus"],
    heat: AT["s7:panas"], expand: AT["s7:mengembang"], shrink: AT["s7:menyusut"], thunder: AT["s7:guntur"],
  };
  // flash events: [time, peak, x, y, z]
  const FL = [
    [EV.hook1, 5, -6.8, 1.6, 7.3], [EV.hook1 + 0.11, 3, -6.8, 1.6, 7.3], [EV.hook2, 6, 5.8, 1.8, 1.8], [EV.hook2 + 0.13, 3.5, 5.8, 1.8, 1.8],
    [s.s2 - 0.1, 5, 0, 5, -4],
    [s.s3 + 2.2, 3, 2, 8, -2], [s.s3 + 5.1, 4, -2, 6, 1], [s.s4 + 1.8, 3, 0, 7, 0], [s.s4 + 5.5, 4, 2, 5, 0],
    [EV.ret, 11, 0, 1.3, 0.3], [EV.ret + 0.13, 6, 0, 1.3, 0.3], [EV.ret + 0.31, 4.5, 0, 1.3, 0.3], [EV.ret + 0.62, 2.5, 0, 1.3, 0.3],
    [s.s7 - 0.05, 8, 0, 1.2, 0.3], [s.s8 + 1.6, 7, 1.2, 1.6, 9.5], [s.s8 + 1.72, 3, 1.2, 1.6, 9.5], [s.s8 + 3.9, 3.5, -7, 3, 15],
  ];
  function flashAt(t) {
    let I = 0, p = null, best = 0;
    for (const e of FL) { if (t < e[0]) continue; const v = e[1] * Math.exp(-(t - e[0]) * 9.5); I += v; if (v > best) { best = v; p = e; } }
    return { I, p };
  }

  // Camera: wide storm, time-lapse from a distance, dive inside, pull out to read charge, drop under the base, fly to the channel, step back to the ground.
  const camT = track([
    [0, 1.4, 0.34, -36, 0, 6.2, 1],
    [s.s2 - 0.1, 0.9, 0.42, -32, 0, 6.3, 1],
    [s.s2 + 0.05, -2, 1.05, -38, 0, 6.6, 0],
    [s.s3 - 1.1, -1.4, 3.2, -34, 0, 6.6, 0],
    [s.s3 + 2.4, 0.2, 7, -5.6, 0, 7.2, 3],
    [s.s3 + 4.4, 0.5, 7, -0.6, 0.5, 7.2, 3],
    [s.s4 + 4.6, 0.3, 7.1, 1.4, 0.3, 7.5, 5],
    [s.s4 + 5.2, 0.2, 7.2, -3.6, 0.2, 7.2, 0],
    [s.s5 - 0.3, -0.5, 6.4, -38, -0.6, 6.3, 0],
    [s.s5 + 2.6, -0.4, 2.8, -24, -0.2, 3.6, 0],
    [EV.lead, 0.2, 0.75, -13.4, -0.15, 1.5, 0.3],
    [EV.ret, 0.4, 0.58, -9.6, -0.15, 1.28, 0.3],
    [s.s6e, 0.5, 0.5, -8.1, -0.15, 1.24, 0.3],
    [s.s7 + 0.2, CHAN.x + 0.08, CHAN.y + 0.04, CHAN.z - 2.5, CHAN.x, CHAN.y, CHAN.z],
    [EV.expand, CHAN.x - 0.05, CHAN.y, CHAN.z - 1.9, CHAN.x, CHAN.y + 0.02, CHAN.z],
    [s.s7e - 0.5, CHAN.x - 0.3, CHAN.y - 0.1, CHAN.z - 3.3, CHAN.x, CHAN.y, CHAN.z],
    [s.s8 - 0.1, CHAN.x - 0.4, CHAN.y - 0.1, CHAN.z - 3.7, CHAN.x, CHAN.y, CHAN.z],
  ]);
  const camEnd = track([[s.s8, 0.25, 0.07, -5.4, 0.1, 0.9, 3], [s.end + 3, 0.1, 0.05, -4.6, 0.1, 1.05, 3]]);
  const rot3 = new THREE.Matrix4();
  const ease = (x) => clamp01(x);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const c = t >= s.s8 ? camEnd(t) : camT(t);
    const f = flashAt(t);
    // strike shake scales with the flash and dies with it
    const shake = Math.min(1, f.I / 18) * 0.05 + ramp(t, EV.thunder - 0.1, EV.thunder + 0.15) * (1 - ramp(t, EV.thunder + 0.2, EV.thunder + 1.4)) * 0.12;
    const sx = Math.sin(t * 91.3) * shake * 0.5, sy = Math.sin(t * 73.1 + 1.2) * shake * 0.5;
    cam.position.set(c[0] + sx, c[1] + sy, c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld();

    // growth: mature storm in the hook, seedling after the seam, full again on the word kumulonimbus
    const g = t < s.s2 ? 1 : ramp(t, s.s2 + 0.2, AT["s2:kumulonimbus"] ?? s.s2e - 1.5) * 0.74 + 0.26;
    U.uGrow.value = g;
    U.uDay.value = t >= s.s2 && t < s.s3 ? (1 - ramp(t, s.s2 + 3.2, s.s3 - 0.5)) * 0.5 : 0;
    U.uTime.value = t;
    U.uCam.value.copy(cam.position);
    U.uRot.value.setFromMatrix4(rot3.extractRotation(cam.matrixWorld));
    const inCloud = ramp(t, s.s3 + 1.3, s.s3 + 2.6) * (1 - ramp(t, s.s4 + 4.7, s.s4 + 5.3));
    U.uInside.value = inCloud;
    const chg = ramp(t, s.s4 + 6.7, s.s4 + 7.7) * (1 - ramp(t, EV.lead - 0.5, EV.ret));
    U.uCharge.value = chg * 0.2;
    U.uFlash.value.set(f.p ? f.p[2] : 0, f.p ? f.p[3] : 5, f.p ? f.p[4] : 0, f.I);
    r.setRenderTarget(volRT); r.render(volScene, volCam); r.setRenderTarget(null);

    // bolts
    for (let i = 0; i < 3; i++) {
      const on = i === 0 ? t >= EV.hook1 && t < EV.hook1 + 0.27 : i === 1 ? t >= EV.hook2 && t < EV.hook2 + 0.32 : t >= s.s8 + 1.6 && t < s.s8 + 1.9;
      farBolts[i].m.visible = on;
      if (on) farBolts[i].m.material.opacity = Math.sin(t * 80) > -0.6 ? 1 : 0.35;
    }
    const stepCount = 10;
    const leadP = clamp01((t - EV.lead) / (EV.meet - EV.lead));
    const stepped = Math.floor(leadP * stepCount + (Math.sin(t * 2) * 0.0)) / stepCount;
    const showL = t >= EV.lead && t < s.s7 + 0.2;
    bolt.visible = showL;
    mainMesh.material = t >= EV.ret ? boltMat : leaderMat;
    const retP = clamp01((t - EV.ret) / 0.1);
    const bright = t >= EV.ret ? 1.2 + Math.min(7, f.I * 0.5) : 1;
    boltMat.color.copy(boltColor).multiplyScalar(bright);
    leaderMat.opacity = 0.55 + 0.45 * (Math.floor(t * 22) % 2);
    mainGeo.setDrawRange(0, t >= EV.meet ? mainFull : Math.floor(mainFull * Math.min(0.84, stepped * 0.84) / 6) * 6);
    for (const b of branches) {
      b.m.material = t >= EV.ret ? boltMat : leaderMat;
      const q = clamp01((stepped - b.at + 0.04) / 0.14);
      b.m.geometry.setDrawRange(0, Math.floor((b.full * q) / 6) * 6);
    }
    const stP = clamp01((t - EV.stream) / Math.max(0.2, EV.meet - EV.stream));
    streamMesh.visible = t >= EV.stream && t < EV.ret + 0.1;
    streamGeo.setDrawRange(0, Math.floor((streamGeo.index.count * stP) / 6) * 6);
    streamMat.opacity = 0.6 + 0.4 * (Math.floor(t * 30) % 2);
    gGroup.visible = t < s.s3 + 0.6 || t > s.s5;
    gGroup.children[1].visible = true;
    beacon.material.color.setRGB(Math.floor(t * 1.4) % 2 ? 7 : 1, 0.3, 0.15);

    // ice flight
    inside.visible = inCloud > 0.01;
    if (inside.visible) {
      const u = t - s.s3;
      const sep = ramp(t, s.s4 + 1.2, s.s4 + 4.6);
      for (let i = 0; i < NC; i++) {
        const q = seedC[i];
        const yy = ((q[1] + u * (0.26 + 0.12 * q[4])) % 1) * 15 - 7.5 + sep * 2.6;
        dm.position.set((q[0] - 0.5) * 7.5 + Math.sin(u * 0.7 + q[3]) * 0.22, yy, -1.6 - q[2] * 9);
        dm.rotation.set(q[3] + u * 1.7, q[3] * 2 + u * 2.3, u * 0.6);
        dm.scale.setScalar(q[4] * inCloud);
        dm.updateMatrix(); crystals.setMatrixAt(i, dm.matrix);
      }
      crystals.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NG; i++) {
        const q = seedG[i];
        const yy = 7.5 - ((q[1] + u * (0.1 + 0.05 * q[4])) % 1) * 15 - sep * 2.7;
        dm.position.set((q[0] - 0.5) * 7 + Math.sin(u * 0.4 + q[3]) * 0.12, yy, -1.6 - q[2] * 8);
        dm.rotation.set(u * 0.8 + q[3], u * 0.5, q[3]);
        dm.scale.setScalar(q[4] * inCloud);
        dm.updateMatrix(); graupel.setMatrixAt(i, dm.matrix);
      }
      graupel.instanceMatrix.needsUpdate = true;
      const signs = ramp(t, s.s4 + 0.1, s.s4 + 1) * inCloud;
      plusM.opacity = minusM.opacity = signs;
      for (let i = 0; i < signsC.length; i++) {
        const q = seedC[i * 6];
        signsC[i].position.set((q[0] - 0.5) * 7.5 + Math.sin(u * 0.7 + q[3]) * 0.22, ((q[1] + u * (0.26 + 0.12 * q[4])) % 1) * 15 - 7.5 + sep * 2.6, -1.6 - q[2] * 9);
      }
      for (let i = 0; i < signsG.length; i++) {
        const q = seedG[i * 2];
        signsG[i].position.set((q[0] - 0.5) * 7 + Math.sin(u * 0.4 + q[3]) * 0.12, 7.5 - ((q[1] + u * (0.1 + 0.05 * q[4])) % 1) * 15 - sep * 2.7, -1.6 - q[2] * 8);
      }
      // collision sparks strike on a fixed rhythm while the camera sits among the ice
      let sparkI = 0, sp = sparks[0];
      const ph = (u * 1.6) % sparks.length, id = Math.floor(ph);
      sp = sparks[id]; sparkI = Math.max(0, 1 - (ph - id) * 4.6);
      spark.position.set(sp.x, sp.y, sp.z);
      spark.material.opacity = sparkI * ramp(t, AT["s3:bertumbukan"] ?? s.s3 + 6, (AT["s3:bertumbukan"] ?? s.s3 + 6) + 0.2) * (1 - sep * 0.5);
      if (t < s.s3 + 2) spark.material.opacity = 0;
      camLamp.intensity = 14 + sparkI * 26;
    }

    // world charge markers
    const q1 = ramp(t, s.s4 + 7.1, s.s4 + 8.1) * (1 - ramp(t, s.s5 + 0.9, s.s5 + 2.2));
    big.visible = q1 > 0.01;
    for (const sprite of bigP) sprite.material.opacity = q1 * 0.85;
    for (const sprite of bigN) sprite.material.opacity = q1 * 0.9;
    for (const sprite of bigP2) sprite.material.opacity = q1 * 0.65;
    for (const sprite of groundP) sprite.material.opacity = ramp(t, s.s5 + 1.7, s.s5 + 2.6) * (1 - ramp(t, EV.meet, EV.ret + 0.3));

    // warm air stops when the tower closes over it
    const wA = ramp(t, s.s2 + 0.3, s.s2 + 1.2) * (1 - ramp(t, s.s3 - 1.2, s.s3 + 0.4));
    warm.visible = wA > 0.01; warmMat.opacity = wA * 0.7;
    if (warm.visible) {
      for (let i = 0; i < NW; i++) {
        const q = seedW[i];
        const y = ((q[1] + (t - s.s2) * 0.14) % 1) * 2.8 * (0.5 + g);
        dm.position.set(q[0] * (1 - y * 0.08) + Math.sin(y + q[3]) * 0.15, y, q[2]);
        dm.rotation.set(0, 0, 0); dm.scale.set(1, 0.8 + (i % 4) * 0.2, 1); dm.updateMatrix(); warm.setMatrixAt(i, dm.matrix);
      }
      warm.instanceMatrix.needsUpdate = true;
    }

    // rain near the camera when it is under the cloud base
    const rA = cam.position.y < 1.5 ? ramp(t, s.s5 + 1.5, s.s5 + 3) : 0;
    rain.visible = rA > 0.01; rainMat.opacity = rA * 0.2 * (1 + Math.min(2, f.I * 0.3));
    if (rain.visible) {
      for (let i = 0; i < NR; i++) {
        const q = seedR[i];
        dm.position.set((q[0] - 0.5) * 2.1, 1.5 - ((q[1] + t * 0.62 * q[3]) % 1) * 3, -0.55 - q[2] * 2.2);
        dm.rotation.set(0, 0, 0.07); dm.scale.setScalar(1); dm.updateMatrix(); rain.setMatrixAt(i, dm.matrix);
      }
      rain.instanceMatrix.needsUpdate = true;
    }

    // heat, expansion, contraction, then pressure waves walking outward
    const coreOn = t > s.s7 - 0.02 && t < s.s7e + 0.1;
    core.visible = coreOn; coreMat.opacity = coreOn ? 1 : 0;
    const heat = ramp(t, EV.heat - 0.2, EV.heat + 1.3);
    coreMat.color.setRGB(2.6 * (0.3 + heat * 1.1), 2.5 * (0.25 + heat * 1.05), 3.6 * (0.55 + heat * 0.7));
    const starts = [EV.expand, EV.shrink + 0.15, EV.thunder - 0.2];
    shocks.forEach((m, i) => {
      const u = t - starts[i];
      m.visible = coreOn && u > 0;
      if (m.visible) { const R = 0.008 + (i === 0 ? 0.62 : 0.75) * (1 - Math.exp(-u * 1.05)); m.scale.set(R, 1, R); m.material.uniforms.a.value = Math.exp(-u * 0.92) * (i === 0 ? 1 : 0.7); }
    });

    bloom.strength = 0.3 + Math.min(0.42, f.I * 0.02);
    r.toneMappingExposure = 1.12 + Math.min(0.28, f.I * 0.012);
    comp.render();
  };
}
