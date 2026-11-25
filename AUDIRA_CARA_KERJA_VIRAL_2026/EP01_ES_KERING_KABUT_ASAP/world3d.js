// EP01 THE LID. A smoke-filled lowland under a warm inversion lid, a twin-turboprop seeding dry ice into the lid, and a macro table where pellets sublimate.
// 1 unit = 100 m in the aerial world. The haze is raymarched against the scene depth so the aircraft and city sit inside it correctly.
// The macro world is in centimetres.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, volumeNoise, noiseGLSL, skyEnv, box, cyl, std } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LID = 18;
const W = 1080, H = 1920;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.01, 6000);
  const rnd = mulberry(1501);
  const noise = volumeNoise(64, 33);
  const SUN = v3(-0.55, 0.32, -0.62).normalize();
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    lima: A_("s2:50", s.s2 + 1), inv: A_("s3:inversi", s.s3 + 1), hangat: A_("s3:hangat", s.s3 + 5), panci: A_("s3:panci", s.s3 + 7),
    gas: A_("s4:gas", s.s4 + 5), kg: A_("s4:kilogram", s.s4 + 6), tabur: A_("s5:ditabur", s.s5 + 4),
    dingin: A_("s6:mendingin", s.s6 + 1), naik: A_("s6:naik", s.s6 + 3), sebar: A_("s6:menyebar", s.s6 + 6),
    pertama: A_("s7:pertama", s.s7 + 1.5), jam: A_("s7:jam", s.s7 + 7), darat: A_("s8:darat", s.s8 + 3),
  };

  // ================= aerial world =================
  const A = new THREE.Scene();
  A.environment = skyEnv(r, 0x6f7f92, 0xc89a6a, 0x3a2a1c, SUN, 0xffb070, 3);
  A.environmentIntensity = 0.5;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uS: { value: SUN } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform vec3 uS;void main(){vec3 n=normalize(v);float y=max(n.y,0.);
      vec3 c=mix(vec3(1.05,.66,.38),vec3(.36,.45,.6),pow(y,.5));float d=max(dot(n,uS),0.);
      c+=vec3(1.,.6,.3)*(pow(d,1400.)*30.+pow(d,18.)*.5);c=mix(c,vec3(.55,.38,.24),smoothstep(.02,-.08,n.y));gl_FragColor=vec4(c,1.);}`,
  }));
  A.add(sky);
  const sun = new THREE.DirectionalLight(0xffb27a, 3.2);
  sun.position.copy(SUN).multiplyScalar(50);
  A.add(sun, sun.target);
  A.add(new THREE.HemisphereLight(0x9aa6b4, 0x3a2a18, 0.7));

  const BURN = [[60, -40, 20], [-80, 30, 26], [120, 60, 20], [-30, -90, 22], [150, -20, 16], [-140, -60, 30], [40, 110, 18]];
  const burnU = BURN.map((b) => new THREE.Vector4(b[0], b[1], b[2], 0));
  const groundGeo = new THREE.PlaneGeometry(1600, 1600, 1, 1);
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, new THREE.ShaderMaterial({
    uniforms: { uNoise: { value: noise }, uSun: { value: SUN }, uBurn: { value: burnU } },
    vertexShader: "varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}",
    fragmentShader: `precision highp float;precision highp sampler3D;varying vec3 vW;uniform vec3 uSun;uniform vec4 uBurn[7];${noiseGLSL}
      void main(){vec2 p=vW.xz;float n=nA(vec3(p*.012,.3));float n2=nC(vec3(p*.09,.6));float n3=nB(vec3(p*.6,.1));
      vec3 forest=mix(vec3(.025,.075,.03),vec3(.06,.14,.045),n2)*(.75+.5*n3);vec3 peat=vec3(.12,.09,.055)*(.8+.4*n3);
      vec3 c=mix(peat,forest,smoothstep(.38,.6,n));
      float burn=0.;for(int i=0;i<7;i++){vec4 b=uBurn[i];burn=max(burn,smoothstep(b.z,b.z*.45,length(p-b.xy)+(n2-.5)*b.z*.7));}
      c=mix(c,vec3(.022,.018,.015)*(.7+.6*n3),burn);
      float rz=sin(p.x*.05)*6.+sin(p.x*.013+1.)*14.-4.;float rv=smoothstep(1.3,.7,abs(p.y-rz));
      c=mix(c,vec3(.2,.15,.1),rv);
      float city=smoothstep(7.,4.,length(p-vec2(0.,6.)));c=mix(c,vec3(.22,.2,.18)*(.8+.4*n3),city*.85);
      float l=max(uSun.y,0.)*1.1+.3;gl_FragColor=vec4(c*l*1.25,1.);}`,
  }));
  A.add(ground);

  // city blocks beside the river
  const NC = 900;
  const cityM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xe2dbcf, 0.85, 0, { emissive: 0x3a2c1e, emissiveIntensity: 1 }), NC);
  const dm = new THREE.Object3D();
  let ci = 0;
  for (let k = 0; ci < NC && k < 9000; k++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 6.2;
    const x = Math.cos(a) * rr, z = 6 + Math.sin(a) * rr;
    const rz = Math.sin(x * 0.05) * 6 + Math.sin(x * 0.013 + 1) * 14 - 4;
    if (Math.abs(z - rz) < 1.4) continue;
    const hgt = 0.03 + Math.pow(rnd(), 3) * (rr < 2.5 ? 0.6 : 0.2);
    dm.position.set(x, hgt / 2, z);
    dm.rotation.y = 0.12;
    dm.scale.set(0.05 + rnd() * 0.1, hgt, 0.05 + rnd() * 0.1);
    dm.updateMatrix();
    cityM.setMatrixAt(ci++, dm.matrix);
  }
  cityM.count = ci;
  A.add(cityM);

  // fire fronts on the burnt patches
  const NF = 420;
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const fires = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), fireMat, NF);
  fires.frustumCulled = false;
  const FD = [];
  for (let i = 0; i < NF; i++) {
    const b = BURN[i % BURN.length];
    const a = rnd() * Math.PI * 2, rr = b[2] * (0.8 + rnd() * 0.25);
    FD.push({ x: b[0] + Math.cos(a) * rr, z: b[1] + Math.sin(a) * rr, s: 0.12 + rnd() * 0.22, ph: rnd() * 9, f: 3 + rnd() * 6 });
    fires.setColorAt(i, new THREE.Color(9, 2.6, 0.4));
  }
  A.add(fires);

  // twin turboprop, high wing, rear ramp. Real size: 16 m long, 20 m span.
  const plane = new THREE.Group();
  const bodyM = std(0xe6e8ea, 0.45, 0.2), darkM = std(0x30353b, 0.5, 0.3), stripe = std(0xd8452b, 0.5);
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.11, 6, 14), bodyM); fus.rotation.z = Math.PI / 2; fus.scale.set(1, 1, 1.05); plane.add(fus);
  const nose = cyl(0.0, 0.013, 0.03, 10, bodyM, 0.078, -0.002, 0, plane); nose.rotation.z = -Math.PI / 2;
  box(0.1, 0.003, 0.0245, stripe, 0, -0.003, 0, plane);
  box(0.04, 0.003, 0.2, bodyM, 0.012, 0.0135, 0, plane);
  [-0.048, 0.048].forEach((z) => {
    const e = cyl(0.006, 0.007, 0.045, 10, darkM, 0.022, 0.007, z, plane); e.rotation.z = Math.PI / 2;
  });
  const props = [-0.048, 0.048].map((z) => {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.017, 24), new THREE.MeshBasicMaterial({ color: 0x223, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
    d.position.set(0.046, 0.007, z); d.rotation.y = Math.PI / 2; plane.add(d); return d;
  });
  const fin = box(0.03, 0.03, 0.003, bodyM, -0.058, 0.024, 0, plane);
  fin.rotation.z = 0.35;
  box(0.022, 0.003, 0.07, bodyM, -0.062, 0.012, 0, plane);
  const ramp_ = box(0.03, 0.003, 0.022, darkM, -0.07, -0.011, 0, plane);
  ramp_.rotation.z = 0.3;
  plane.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  A.add(plane);

  const ZP = 22;
  const S5 = s.s5, S6 = s.s6;
  // Normal cruise in s1-s3; in s5 the pass is time-lapsed so one seeding run fits the chapter.
  function planeX(t) {
    if (t < S5) return -12 + 0.72 * t;
    return -24 + 3.6 * (t - S5);
  }
  function planeY(t) { return t < S5 ? LID + 3.2 : LID + 1.6; }
  const P = (t) => v3(planeX(t), planeY(t), ZP);

  // ---------- overlay scene: lid sheet and pellet/sublimation particles, depth-tested against the scene by hand ----------
  const O = new THREE.Scene();
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(W, H, THREE.FloatType) });
  const TR = { value: new THREE.Vector4(-24, -24, ZP, 2.2) };
  const shared = { tDepth: { value: rt.depthTexture }, uRes: { value: new THREE.Vector2(W, H) }, uTrail: TR, uRise: { value: 0 }, uCold: { value: 0 }, uVis: { value: 0 }, uCam: { value: new THREE.Vector3() } };
  const trailGLSL = `uniform vec4 uTrail;float trail(vec2 xz){float a=smoothstep(uTrail.x-3.,uTrail.x+2.,xz.x)*(1.-smoothstep(uTrail.y-1.,uTrail.y+3.,xz.x));return a*exp(-pow((xz.y-uTrail.z)/uTrail.w,2.));}`;
  const lidGeo = new THREE.PlaneGeometry(900, 900, 1, 1);
  lidGeo.rotateX(-Math.PI / 2);
  const lid = new THREE.Mesh(lidGeo, new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: "varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}",
    fragmentShader: `precision highp float;varying vec3 vW;uniform sampler2D tDepth;uniform vec2 uRes;uniform float uRise,uCold,uVis;uniform vec3 uCam;${trailGLSL}
      void main(){if(gl_FragCoord.z>texture2D(tDepth,gl_FragCoord.xy/uRes).r)discard;
      float m=trail(vW.xz);float hole=smoothstep(.2,.55,m*uRise);
      vec2 g=abs(fract(vW.xz/3.)-.5);float line=smoothstep(.465,.5,max(g.x,g.y));
      float fade=exp(-length(vW.xz-uCam.xz)*.012);
      vec3 warm=vec3(2.4,.8,.22),cold=vec3(.3,1.15,2.8);float ck=clamp(m*uCold*1.4,0.,1.);
      vec3 c=mix(warm,cold,ck);
      float a=((.03+line*.17)*uVis+ck*.2)*(1.-hole)*fade;
      if(a<.002)discard;gl_FragColor=vec4(c,a);}`,
  }));
  lid.position.y = LID;
  lid.frustumCulled = false;
  O.add(lid);

  // particles: spawned along the flight path, they sink, spread and fade. Pure function of t.
  const SP = [];
  const addRun = (a, b, step) => { for (let tb = a; tb < b; tb += step) SP.push({ tb, ox: (rnd() - 0.5) * 0.02, oz: (rnd() - 0.5) * 0.02, vx: (rnd() - 0.5) * 0.05, vz: (rnd() - 0.5) * 0.05, k: rnd() }); };
  addRun(0.2, s.s2 + 0.5, 0.012);
  addRun(S5 + 0.3, S6 + 1.5, 0.02);
  const NP = SP.length;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(NP * 3), pSz = new Float32Array(NP), pA = new Float32Array(NP);
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("sz", new THREE.BufferAttribute(pSz, 1));
  pGeo.setAttribute("al", new THREE.BufferAttribute(pA, 1));
  const pts = new THREE.Points(pGeo, new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `attribute float sz,al;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*2790./max(.01,-mv.z);vA=al;}`,
    fragmentShader: `uniform sampler2D tDepth;uniform vec2 uRes;varying float vA;void main(){if(gl_FragCoord.z>texture2D(tDepth,gl_FragCoord.xy/uRes).r)discard;
      vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vec3(1.05,1.12,1.25),vA*(1.-d)*(1.-d));}`,
  }));
  pts.frustumCulled = false;
  O.add(pts);

  // ---------- haze pass ----------
  const HZ = {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, uNoise: { value: noise },
    uInvProj: { value: new THREE.Matrix4() }, uCamW: { value: new THREE.Matrix4() }, uCam: { value: new THREE.Vector3() }, uSun: { value: SUN },
    uT: { value: 0 }, uLid: { value: LID }, uDens: { value: 1 }, uRise: shared.uRise, uTrail: TR, uTop: { value: LID + 20 },
  };
  const hazePass = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: HZ, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;precision highp sampler3D;varying vec2 vUv;uniform sampler2D tColor,tDepth;uniform mat4 uInvProj,uCamW;uniform vec3 uCam,uSun;
      uniform float uT,uLid,uDens,uRise,uTop;${noiseGLSL}${trailGLSL}
      float lidAt(vec2 xz){return uLid+uRise*trail(xz)*15.;}
      float dens(vec3 p){float L=lidAt(p.xz);if(p.y>L+4.||p.y<0.)return 0.;
        float n=nA(p*vec3(.011,.028,.011)+vec3(uT*.0016,0.,uT*.0009))*.62+nC(p*vec3(.045,.07,.045)+vec3(0.,-uT*.003,0.))*.38;
        float tm=trail(p.xz)*uRise;
        float b=nA(p*vec3(.03,.05,.03)+vec3(uT*.003,0.,0.));
        float edge=L+(b-.5)*(5.+tm*10.)+(n-.5)*1.5;
        float top=smoothstep(edge+.6,edge-.9,p.y);
        float under=smoothstep(L-7.,L-1.,p.y);
        return top*(.18+1.3*under*smoothstep(.25,.75,n*.6+b*.6))*(1.-.55*tm);}
      void main(){vec4 sc=texture2D(tColor,vUv);float z=texture2D(tDepth,vUv).r;
        vec4 v=uInvProj*vec4(vUv*2.-1.,min(z,.999999)*2.-1.,1.);v/=v.w;vec3 wp=(uCamW*vec4(v.xyz,1.)).xyz;
        vec3 rd=normalize(wp-uCam);float dist=z>=.999999?1e5:length(wp-uCam);
        if(z<.999999)sc.rgb=mix(sc.rgb,vec3(.55,.4,.28),1.-exp(-min(dist,4000.)*.00045));
        float t0,t1;
        if(abs(rd.y)<1e-4){t0=0.;t1=(uCam.y>0.&&uCam.y<uTop)?1e5:-1.;}else{float ta=-uCam.y/rd.y,tb=(uTop-uCam.y)/rd.y;t0=max(min(ta,tb),0.);t1=max(ta,tb);}
        t1=min(t1,min(dist,700.));
        if(t1<=t0){gl_FragColor=sc;return;}
        const int N=64;float dt=(t1-t0)/float(N);float j=hash12(gl_FragCoord.xy+fract(uT*7.)*91.);
        float Tr=1.;vec3 Ls=vec3(0.);float ph=.38+1.1*pow(max(dot(rd,uSun),0.),5.);
        for(int i=0;i<N;i++){vec3 p=uCam+rd*(t0+(float(i)+j)*dt);float d=dens(p);
          if(d>.001){float sg=d*uDens*.06;float hy=clamp(p.y/max(lidAt(p.xz),1.),0.,1.4);
            float sh=exp(-(dens(p+uSun*1.2)+dens(p+uSun*3.))*1.8);
            vec3 col=vec3(1.15,.72,.4)*ph*sh*(.3+.8*hy)+mix(vec3(.05,.035,.025),vec3(.2,.14,.1),hy);
            float a=exp(-sg*dt);Ls+=Tr*(1.-a)*col;Tr*=a;if(Tr<.01)break;}}
        gl_FragColor=vec4(sc.rgb*Tr+Ls,1.);}`,
  }), "tNone");
  hazePass.material.depthTest = false;
  hazePass.material.depthWrite = false;
  const ovPass = new RenderPass(O, cam);
  ovPass.clear = false;
  const cA = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
  cA.addPass(hazePass);
  cA.addPass(ovPass);
  cA.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.5, 1.15));
  cA.addPass(new OutputPass());

  // ================= macro table: dry ice pellets, then 1 kg vs 500 L =================
  const B = new THREE.Scene();
  B.background = new THREE.Color(0x05080c);
  B.environment = skyEnv(r, 0x2a3a52, 0x0d1520, 0x020304, v3(0.3, 1, 0.4), 0xbfe0ff, 1.5);
  B.environmentIntensity = 0.7;
  const key = new THREE.SpotLight(0xdcecff, 420, 0, 0.55, 0.6);
  key.position.set(-30, 60, 30); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  B.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x5fb4ff, 2.2); rim.position.set(20, 20, -40); B.add(rim);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std(0x0b0f14, 0.35, 0.6));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; B.add(table);
  const tray = box(34, 1.2, 24, std(0x8f969c, 0.28, 0.95), 0, 0.6, 0, B);
  const iceM = new THREE.MeshStandardMaterial({ color: 0xf2f6fb, roughness: 0.55, metalness: 0, emissive: 0x4d6a8a, emissiveIntensity: 0.12 });
  const NPel = 700;
  const pel = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.32, 1.0, 10), iceM, NPel);
  pel.castShadow = pel.receiveShadow = true;
  for (let i = 0; i < NPel; i++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 9;
    const hh = 1.2 + Math.max(0, 5.2 * (1 - (rr / 9) ** 1.6)) * rnd() + 0.3;
    dm.position.set(Math.cos(a) * rr * 1.2, hh, Math.sin(a) * rr * 0.9);
    dm.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    dm.scale.setScalar(0.8 + rnd() * 0.5);
    dm.updateMatrix();
    pel.setMatrixAt(i, dm.matrix);
  }
  B.add(pel);
  // 1 kg block (about 11.6 cm cube at 1.56 g/cm3) and the 500 L volume it becomes (79 cm cube)
  const blockX = 46;
  const block = box(11.6, 11.6, 11.6, iceM, blockX, 5.8, 0, B);
  const cube = new THREE.Group(); cube.position.set(blockX, 0, 0); B.add(cube);
  const edgeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 2.2, 3) });
  const S79 = 79, hs = S79 / 2;
  const edges = [];
  for (const [ax, x, y, z] of [["x", 0, 0, -1], ["x", 0, 2, -1], ["x", 0, 0, 1], ["x", 0, 2, 1], ["z", -1, 0, 0], ["z", 1, 0, 0], ["z", -1, 2, 0], ["z", 1, 2, 0], ["y", -1, 1, -1], ["y", 1, 1, -1], ["y", -1, 1, 1], ["y", 1, 1, 1]]) {
    const g = ax === "x" ? [S79, 0.5, 0.5] : ax === "y" ? [0.5, S79, 0.5] : [0.5, 0.5, S79];
    const m = box(g[0], g[1], g[2], edgeM, x * hs, y * hs, z * hs, cube);
    m.castShadow = false;
    edges.push(m);
  }
  const glass = new THREE.Mesh(new THREE.BoxGeometry(S79, S79, S79), new THREE.MeshBasicMaterial({ color: 0x6fc3ff, transparent: true, opacity: 0.05, depthWrite: false }));
  glass.position.y = hs; cube.add(glass);
  // fog sprites: CO2 gas is heavier than air, so it pours off the tray and spreads along the table
  const NG = 1100;
  const GD = [];
  for (let i = 0; i < NG; i++) GD.push({ tb: rnd() * 30, a: rnd() * Math.PI * 2, r0: rnd() * 8, sp: 2 + rnd() * 5, k: rnd(), fill: i < 420 });
  const gGeo = new THREE.BufferGeometry();
  const gPos = new Float32Array(NG * 3), gSz = new Float32Array(NG), gA = new Float32Array(NG);
  gGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute("sz", new THREE.BufferAttribute(gSz, 1));
  gGeo.setAttribute("al", new THREE.BufferAttribute(gA, 1));
  const fog = new THREE.Points(gGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `attribute float sz,al;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*2790./max(.1,-mv.z);vA=al;}`,
    fragmentShader: `varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vec3(.9,.96,1.08),vA*pow(1.-d,1.6));}`,
  }));
  fog.frustumCulled = false;
  B.add(fog);
  const cB = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
  cB.addPass(new RenderPass(B, cam));
  cB.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.45, 1.2));
  cB.addPass(new OutputPass());

  const look = (p, q) => { cam.position.copy(p); cam.lookAt(q); };
  const lerpV = (a, b, u) => a.clone().lerp(b, u);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    // ---------------- macro chapter ----------------
    if (t >= s.s4 && t < s.s5) {
      const u = (t - s.s4) / (s.s5 - s.s4);
      const pull = ramp(t, E.kg - 0.6, E.kg + 1.6);
      const c0 = v3(-14 + u * 6, 15 - u * 3, 30 - u * 4), c1 = v3(blockX - 62, 62, 128);
      const l0 = v3(0, 3.5, 0), l1 = v3(blockX - 12, 30, 0);
      look(lerpV(c0, c1, pull), lerpV(l0, l1, pull));
      const surge = 1 + ramp(t, E.gas - 0.3, E.gas + 0.8) * 1.4;
      const fillU = ramp(t, E.kg, s.s5 - 0.4);
      block.visible = pull > 0.01;
      block.scale.setScalar(Math.max(0.001, 1 - fillU * 0.5));
      block.position.y = 5.8 * block.scale.y;
      cube.visible = pull > 0.01;
      const ce = ramp(t, E.kg + 0.2, E.kg + 1.6);
      edges.forEach((m, i) => m.scale.setScalar(Math.max(0.001, ramp(ce * 12 - i, 0, 1))));
      glass.material.opacity = 0.05 * ce;
      for (let i = 0; i < NG; i++) {
        const g = GD[i];
        let x, y, z, al, sz;
        if (g.fill) {
          // gas filling the 79 cm box from the shrinking block
          const age = (t - E.kg) * (0.6 + g.k) - g.k * 2;
          const v = clamp01(age / 3);
          x = blockX + Math.cos(g.a) * hs * 0.85 * v * g.k; z = Math.sin(g.a) * hs * 0.85 * v * (1 - g.k * 0.3);
          y = 6 + (g.r0 / 8) * (S79 - 10) * v;
          al = fillU > 0 && age > 0 ? 0.05 + 0.06 * fillU : 0; sz = 6 + 16 * v;
        } else {
          const life = 3.4;
          const age = ((t - s.s4) * surge + g.tb) % life;
          const v = age / life;
          const rr = g.r0 + g.sp * age * 1.6;
          x = Math.cos(g.a) * rr * 1.2; z = Math.sin(g.a) * rr * 0.9;
          const onTray = Math.abs(x) < 17 && Math.abs(z) < 12;
          y = onTray ? 3 + 4 * (1 - g.r0 / 8) * (1 - v) + 1.2 : Math.max(0.6, 1.2 - (rr - 14) * 0.3);
          al = 0.045 * Math.sin(Math.PI * v) * (0.6 + 0.4 * surge) * (1 - pull * 0.6); sz = 2.5 + 7 * v;
        }
        gPos[i * 3] = x; gPos[i * 3 + 1] = y; gPos[i * 3 + 2] = z; gSz[i] = sz; gA[i] = al;
      }
      gGeo.attributes.position.needsUpdate = gGeo.attributes.sz.needsUpdate = gGeo.attributes.al.needsUpdate = true;
      cB.render();
      return;
    }

    // ---------------- aerial chapters ----------------
    const pp = P(t);
    plane.position.copy(pp);
    plane.rotation.set(0.02 * Math.sin(t * 0.7), 0, 0.012 * Math.sin(t * 0.5));
    props.forEach((d, i) => { d.rotation.x = t * 40 + i; });
    HZ.uT.value = t;
    // seeding trail and lid response
    const trailX1 = t < S5 ? -24 : Math.min(planeX(t), planeX(S6 + 0.6));
    TR.value.set(-24, trailX1, ZP, 1.6 + ramp(t, S5, s.s7) * 5.5);
    shared.uCold.value = t >= S5 ? ramp(t, S5 + 0.5, E.tabur + 1) : 0;
    shared.uRise.value = t >= S6 ? ramp(t, E.naik - 0.6, E.sebar + 1.2) * (t >= s.s8 ? 1 - 0.5 * ramp(t, s.s8, s.end) : 1) : 0;
    shared.uVis.value = t >= s.s3 && t < s.s4 ? ramp(t, E.inv - 0.2, E.inv + 0.6) : t >= S5 && t < s.s7 ? 0.55 : 0;
    // density: thick near the ground when we are inside it; clears on the first-day report then partly returns
    let dens = 1.0;
    if (t >= s.s2 && t < s.s3) dens = 1 + 5 * ramp(t, s.s2 + 2.5, s.s3 - 1.5);
    if (t >= s.s7 && t < s.s8) dens = 6 - 5 * ramp(t, E.pertama, E.pertama + 2.5) + 2 * ramp(t, E.jam - 1, E.jam + 2);
    HZ.uDens.value = dens;

    // cameras, one per chapter
    if (t < s.s2) {
      const u = t / s.s2;
      const off = v3(-1.25 + 0.35 * u, 0.36 + 0.06 * Math.sin(t * 0.6), 0.7 - 1.3 * u);
      look(pp.clone().add(off), pp.clone().add(v3(0.55, -0.32, 0)));
    } else if (t < s.s3) {
      const u = ramp(t, s.s2, s.s3 - 0.3);
      const c = v3(-3 + u * 1.5, THREE.MathUtils.lerp(34, 0.45, Math.pow(u, 0.7)), THREE.MathUtils.lerp(46, 15, u));
      const l = v3(0, THREE.MathUtils.lerp(4, 0.35, u), 6);
      look(c, l);
    } else if (t < S5) {
      const u = (t - s.s3) / (S5 - s.s3);
      look(v3(-36 + 10 * u, 31 - 4 * u, 74 - 6 * u), v3(-4 + 4 * u, LID - 3, 6));
    } else if (t < S6) {
      const u = (t - S5) / (S6 - S5);
      look(pp.clone().add(v3(-5.5 - 3 * u, 2.4 + 1.5 * u, 4.5 + 2 * u)), pp.clone().add(v3(1.2, -1.2, -0.5)));
    } else if (t < s.s7) {
      const u = (t - S6) / (s.s7 - S6);
      const cx = (-24 + trailX1) / 2, a = -0.9 + 0.6 * u;
      look(v3(cx + Math.sin(a) * 52, 26 + 6 * u, ZP + Math.cos(a) * 52), v3(cx, LID + 2 + 4 * u, ZP));
    } else if (t < s.s8) {
      const u = (t - s.s7) / (s.s8 - s.s7);
      look(v3(-1.6 + 0.8 * u, 0.42 + 0.05 * u, 14.5 - 1.8 * u), v3(0.4, 0.3 + 0.04 * u, 6));
    } else {
      const u = ramp(t, s.s8, s.dur);
      look(v3(30 - 10 * u, 5 + 30 * u, 26 + 40 * u), v3(60, 0, -40));
    }
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    HZ.uInvProj.value.copy(cam.projectionMatrixInverse);
    HZ.uCamW.value.copy(cam.matrixWorld);
    HZ.uCam.value.copy(cam.position);
    shared.uCam.value.copy(cam.position);
    plane.visible = t < s.s2 + 0.2 || t >= S5;

    for (let i = 0; i < NF; i++) {
      const f = FD[i];
      const fl = 0.7 + 0.3 * Math.sin(t * f.f + f.ph) * Math.sin(t * f.f * 0.37 + f.ph * 2);
      const big = t >= s.s8 ? 1 + 0.6 * ramp(t, E.darat - 1, E.darat + 0.5) : 1;
      dm.position.set(f.x, f.s * 0.5, f.z); dm.rotation.set(0, 0, 0); dm.scale.setScalar(f.s * fl * big * (t >= s.s7 && t < s.s8 ? 0.4 : 1)); dm.updateMatrix();
      fires.setMatrixAt(i, dm.matrix);
    }
    fires.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < NP; i++) {
      const g = SP[i];
      const age = t - g.tb;
      if (age < 0 || age > 9) { pSz[i] = 0; pA[i] = 0; continue; }
      const p0 = P(g.tb);
      const fast = g.tb >= S5;
      const sink = fast ? 0.32 : 0.18;
      pPos[i * 3] = p0.x - 0.075 + g.ox + g.vx * age + (fast ? 0 : 0.18 * Math.min(age, 0.6));
      pPos[i * 3 + 1] = p0.y - 0.012 - sink * age - 0.25 * Math.min(age, 0.4);
      pPos[i * 3 + 2] = p0.z + g.oz + g.vz * age * (fast ? 4 : 1);
      pSz[i] = (fast ? 0.12 : 0.012) + age * (fast ? 0.22 : 0.03);
      pA[i] = Math.min(1, age * 4) * Math.exp(-age * (fast ? 0.35 : 0.5)) * (fast ? 0.32 : 0.5);
    }
    pGeo.attributes.position.needsUpdate = pGeo.attributes.sz.needsUpdate = pGeo.attributes.al.needsUpdate = true;
    pts.visible = t < s.s2 + 1 || (t >= S5 && t < s.s7);

    r.setRenderTarget(rt);
    r.render(A, cam);
    r.setRenderTarget(null);
    cA.render();
  };
}
