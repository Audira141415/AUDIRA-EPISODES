// EP02 THE SECTION. A real displaced mountain is sliced by a moving plane; the cut face is a procedural geological section with magma, conduit and growing bubbles.
// Mechanism follows USGS and the decompression model: magma rises, pressure falls, dissolved gas exsolves. Thin magma lets gas go; thick magma traps it.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, track, volumeNoise, noiseGLSL, skyEnv } from "./lib3d.js";

// Height of the cone with a crater; x,z in km, y in km.
const H0 = 3.2;
function hMount(x, z) {
  const r = Math.hypot(x, z);
  const cone = H0 * Math.pow(Math.max(0, 1 - r / 13), 1.55);
  const crater = -0.5 * Math.exp(-((r / 0.5) ** 2));
  const ribs = 0.22 * Math.sin(Math.atan2(z, x) * 9 + r * 0.7) * Math.exp(-((r - 4.5) ** 2) / 14) * Math.min(1, r);
  return cone + crater + ribs;
}

const SECTION = `
precision highp float;
varying vec3 vP;
uniform float uTime, uChamber, uRise, uBub, uGasVis, uThick, uPlug;
${noiseGLSL}
// Chamber, feeder and conduit share a single smooth field so magma reads as one connected body.
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float chamber(vec2 p){vec2 q=(p-vec2(0.,-7.))/vec2(3.6,1.85);return (length(q)-1.)*1.85;}
float conduit(vec2 p){float w=.11+.08*smoothstep(-5.,2.5,p.y)+.05*sin(p.y*1.8);float x=p.x-.22*sin(p.y*.55);return abs(x)-w;}
float deep(vec2 p){float x=p.x+.5*sin(p.y*.8);return max(abs(x)-(.45+.5*smoothstep(-9.,-13.,p.y)),p.y+7.5);}
float magma(vec2 p){
  float top=mix(-5.2,3.05,uRise);
  float cd=max(conduit(p),p.y-top);
  if(p.y>-5.2&&uRise<=0.) cd=1.;
  float m=smin(chamber(p),deep(p),.7);
  return smin(m,cd,.32);
}
vec3 rock(vec2 p){
  float warp=(fbm3(vec3(p*.05,.3))-.5)*3.;
  float y=p.y+warp*.8+p.x*.05;
  float l=fbm3(vec3(p.x*.018,y*.2,.7));
  float band=fbm3(vec3(p.x*.012,y*.42,.11));
  vec3 c=mix(vec3(.05,.042,.038),vec3(.135,.105,.085),smoothstep(.3,.72,band));
  // the cone is stacked lava and ash, thin irregular beds dipping with the flanks
  float cone=smoothstep(-.3,.25,p.y);
  float dip=p.y+abs(p.x)*.27;
  float beds=fbm3(vec3(p.x*.03,dip*.72,.47));
  vec3 cc=mix(vec3(.04,.036,.036),vec3(.15,.118,.1),smoothstep(.34,.66,beds));
  c=mix(c,cc,cone);
  float hot=smoothstep(-2.5,-13.,p.y);
  c=mix(c,vec3(.17,.075,.045),hot*.75);
  float g=nB(vec3(p*.46,.1))*.55+nC(vec3(p*1.4,.2))*.45;
  c*=.62+g*.95;
  float cr=abs(nA(vec3(p*.13,.5))-.5);
  c*=.78+.22*smoothstep(.0,.02,cr);
  return c;
}
void main(){
  vec2 p=vP.xy;
  vec3 col=rock(p);
  float d=magma(p);
  // heat halo soaks into the surrounding rock
  float halo=exp(-max(d,0.)*2.6)*uChamber;
  col+=vec3(.75,.15,.025)*halo*.2;
  float inner=smoothstep(.04,-.03,d);
  if(inner>0.&&uChamber>0.){
    float t=uTime;
    vec3 q=vec3(p*.17,t*.022);
    float n=fbm3(q+vec3(0.,-t*.018,0.))*.8+nC(vec3(p*.3,t*.04))*.2;
    float lum=smoothstep(.34,.66,n);
    vec3 lava=mix(vec3(.3,.022,.004),vec3(1.5,.34,.03),lum);
    lava=mix(lava,vec3(3.2,1.35,.26),smoothstep(.6,.78,n));
    lava*=1.-uThick*.5;
    float edge=smoothstep(-.42,-.02,d);
    lava=mix(lava,vec3(.24,.03,.01),edge*.72);
    col=mix(col,lava*uChamber,inner);
  }
  // dissolved gas as fine pale specks: only drawn while the soda analogy is on screen
  float dots=0.;
  if(uGasVis>0.&&d<0.){
    vec2 g=p*vec2(7.,7.)+vec2(0.,uTime*.05);
    vec2 id=floor(g);vec2 f=fract(g)-.5;
    float h=hash12(id);
    dots=smoothstep(.05+fract(h*13.)*.09,.02,length(f+vec2(h-.5,fract(h*7.)-.5)*.72))*step(.55,h);
  }
  col+=vec3(1.,.9,.7)*dots*uGasVis*1.1;
  gl_FragColor=vec4(col,1.);
}`;


const PLUME = `
precision highp float;
varying vec2 vUv;
uniform vec3 uCam; uniform mat3 uRot; uniform float uTanF,uAspect,uTime,uColumn,uPDC,uSteam;
${noiseGLSL}
const vec3 SUN=normalize(vec3(.75,.5,-.5));
float colD(vec3 p){
  if(uColumn<=0.) return 0.;
  float base=2.6; float H=base+uColumn*18.;
  float h=(p.y-base)/(H-base);
  if(h<0.||h>1.15) return 0.;
  // gas-thrust column widens with entrainment, then spreads as an umbrella at neutral buoyancy
  float um=smoothstep(.72,1.,h);
  float R=.5+h*1.75+um*um*8.5*uColumn;
  vec3 w=p*vec3(1.,.8,1.)+vec3(0.,-uTime*.62,0.);
  float n=fbm3(w*.058)+.42*nC(w*.2)+.16*nB(w*.55)-.68;
  float c=(R-length(p.xz+vec2(sin(p.y*.27)*.55,0.)))/R*.82+n*1.75;
  c*=1.-smoothstep(.9,1.08,h)*.9;
  return smoothstep(0.,.13,c);
}
float pdcD(vec3 p){
  if(uPDC<=0.) return 0.;
  // ground-hugging current runs down the -x flank toward camera side
  vec2 dir=normalize(vec2(-.72,.7));float r=dot(p.xz,dir);float perp=dot(p.xz,vec2(-dir.y,dir.x));
  if(r<0.) return 0.;
  float front=uPDC*11.5;
  float gh=3.2*pow(max(0.,1.-length(p.xz)/13.),1.55);
  float ht=.28+.12*r;
  float y=p.y-gh;
  if(y<-.2||y>ht*2.) return 0.;
  vec3 w=p+vec3(uTime*.34,-uTime*.1,0.);
  float n=fbm3(w*.14)+.45*nC(w*.42)+.15*nB(w*1.1)-.66;
  float wid=.8+r*.2;
  float c=(1.-y/(ht*1.5))*.62+(1.-abs(perp)/wid)*.6-.6+n*2.;
  c*=1.-smoothstep(front-1.6,front+.4,r+(n*3.));
  return smoothstep(0.,.14,c);
}
float steamD(vec3 p){
  if(uSteam<=0.) return 0.;
  float h=(p.y-2.75)/5.;
  if(h<0.||h>1.) return 0.;
  vec3 w=p+vec3(-uTime*.05,-uTime*.2,0.);
  float n=fbm3(w*.3)+.4*nC(w*.9)-.42;
  float R=.16+h*1.;
  float c=(R-length(p.xz+vec2(-h*h*1.1,0.)))/R*.55+n*1.1-h*.55;
  return smoothstep(0.,.3,c)*uSteam*.5;
}
void main(){
  vec2 uv=vUv*2.-1.;
  vec3 rd=normalize(uRot*vec3(uv.x*uTanF*uAspect,uv.y*uTanF,-1.));
  vec3 ro=uCam;
  // bound by a slab around the column and the current
  float t=max(1.,length(ro)-30.)+hash12(gl_FragCoord.xy)*.28;
  vec3 acc=vec3(0.);float T=1.;
  for(int i=0;i<150;i++){
    if(T<.02||t>90.) break;
    vec3 p=ro+rd*t;
    float a=colD(p),b=pdcD(p),s=steamD(p);
    float d=max(a,max(b,s));
    if(d>.004){
      // cheap light probe
      float ld=colD(p+SUN*.6)+colD(p+SUN*1.5)+pdcD(p+SUN*.5);
      float L=exp(-ld*.5);
      vec3 base=b>a?vec3(.17,.15,.135):vec3(.14,.125,.118);
      if(s>a&&s>b) base=vec3(.62,.62,.64);
      vec3 c=base*(.5+L*.72)*(.72+.56*nC(p*.42));
      // incandescent underside near the vent
      float g=exp(-max(p.y-2.6,0.)*.62)*exp(-length(p.xz)*.4);
      c+=vec3(2.8,.75,.08)*g*(a>0.?1.:0.);
      float ab=d*.28*2.6;
      float tr=exp(-ab);
      acc+=T*(1.-tr)*c;T*=tr;
    }
    t+=.28+t*.004;
  }
  gl_FragColor=vec4(acc,1.-T);
}`;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.localClippingEnabled = true;
  r.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.02, 400);
  scene.add(cam);
  const rnd = mulberry(1980);
  const noise = volumeNoise(64, 29);
  const SUN = new THREE.Vector3(0.75, 0.5, -0.5).normalize();
  scene.environment = skyEnv(r, 0x5d7ea8, 0xc9b59d, 0x2a2018, SUN, 0xffe0c0, 3);
  scene.environmentIntensity = 0.42;
  const key = new THREE.DirectionalLight(0xffdcb5, 2.9);
  key.position.copy(SUN).multiplyScalar(40);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.normalBias = 0.06; key.shadow.bias = -0.0006;
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 });
  scene.add(key);

  // sky dome
  const skyU = { d: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform float d;void main(){vec3 n=normalize(v);float y=max(n.y,0.);
      vec3 c=mix(vec3(.85,.7,.52),vec3(.12,.3,.62),pow(y,.34));
      c=mix(c,mix(vec3(.15,.1,.08),vec3(.03,.03,.04),pow(y,.5)),d);
      gl_FragColor=vec4(c,1.);}`,
  }));
  scene.add(sky);

  // Slicing plane: everything with z>cut is removed so the section shows.
  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 40);
  // mountain mesh
  const SEG = 420, SIZE = 40;
  const mg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  mg.rotateX(-Math.PI / 2);
  const mp = mg.attributes.position;
  for (let i = 0; i < mp.count; i++) {
    const x = mp.getX(i), z = mp.getZ(i);
    const n1 = Math.sin(x * 1.3 + z * 0.7) * Math.sin(z * 1.1 - x * 0.4) * 0.06;
    mp.setY(i, hMount(x, z) + n1);
  }
  mg.computeVertexNormals();
  const MU = { uNoise: { value: noise }, uFlow: { value: 0 }, uAsh: { value: 0 }, uTime: { value: 0 } };
  const mtn = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0, clippingPlanes: [clip], side: THREE.DoubleSide });
  mtn.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, MU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vW;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvW=position;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
      varying vec3 vW; uniform sampler3D uNoise; uniform float uFlow,uAsh,uTime;`)
      .replace("#include <color_fragment>", `#include <color_fragment>
      {float r=length(vW.xz);float n=texture(uNoise,vec3(vW.xz*.09,.2)).r;float n2=texture(uNoise,vec3(vW.xz*.55,.6)).g;float n3=texture(uNoise,vec3(vW.xz*1.9,.3)).b;
       float h=vW.y;
       vec3 forest=mix(vec3(.03,.06,.022),vec3(.075,.125,.05),smoothstep(.25,.7,n2*.55+n3*.45));
       vec3 scree=mix(vec3(.13,.115,.105),vec3(.29,.25,.21),n2*.6+n3*.4);
       vec3 c=mix(forest,scree,smoothstep(1.05,1.95,h+(n-.5)*1.1));
       c=mix(c,vec3(.05,.045,.045),smoothstep(2.8,3.05,h));
       c=mix(c,vec3(.075,.07,.07),uAsh*smoothstep(.2,.5,n2+.2));
       diffuseColor.rgb=c;}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
      {// Basalt flow: an open channel running down the +x flank, front advancing with uFlow.
       float a=atan(vW.z+.0,vW.x);float r=length(vW.xz);
       float wob=(texture(uNoise,vec3(vW.xz*.11,.1)).r-.5)*.5+(texture(uNoise,vec3(vW.xz*.4,.4)).g-.5)*.12;
       float width=.1+r*.045;
       float ch=1.-smoothstep(width*.32,width,abs(a-.72+wob)*max(r,.25));
       float front=uFlow*10.5;
       float m=ch*(1.-smoothstep(front-.3,front+.1,r));
       if(m>.001){vec2 u=vec2(r*1.25-uTime*.28,a*5.);float t0=texture(uNoise,vec3(u*.17,.33)).r;float t1=texture(uNoise,vec3(u*.65,.7)).g;
         float crust=smoothstep(.45,.7,t0*.7+t1*.3);
         vec3 hot=mix(vec3(5.,1.25,.1),vec3(.25,.03,.01),crust);
         hot*=(1.-smoothstep(1.,10.5,r)*.45);
         totalEmissiveRadiance+=hot*m;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.02),m);}
       }`);
  };
  const plain = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x141f10, roughness: 1 }));
  plain.rotation.x = -Math.PI / 2; plain.position.y = -0.12; scene.add(plain);
  const mountain = new THREE.Mesh(mg, mtn);
  mountain.receiveShadow = mountain.castShadow = true;
  scene.add(mountain);

  // Trees on the lower slope give the mountain scale; they sit on the same clipping plane.
  const treeGeo = new THREE.ConeGeometry(0.016, 0.055, 5);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x20361a, roughness: 1, clippingPlanes: [clip] });
  const NT = 22000;
  const trees = new THREE.InstancedMesh(treeGeo, treeMat, NT);
  const dm = new THREE.Object3D();
  for (let i = 0; i < NT; i++) {
    const a = rnd() * 6.283, d = 6.2 + rnd() * 13.4;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    dm.position.set(x, hMount(x, z) + 0.022, z);
    dm.scale.setScalar(0.7 + rnd() * 0.8);
    dm.updateMatrix(); trees.setMatrixAt(i, dm.matrix);
  }
  trees.castShadow = true;
  scene.add(trees);

  // section face is a tall quad at z = cut, showing crust down to -14 km; follows the mountain profile on top via clipping in the shader
  const SU = { uNoise: { value: noise }, uTime: { value: 0 }, uChamber: { value: 0 }, uRise: { value: 0 }, uBub: { value: 0 }, uGasVis: { value: 0 }, uThick: { value: 0 }, uPlug: { value: 0 } };
  const secG = new THREE.PlaneGeometry(SIZE, 18, 800, 360);
  secG.translate(0, -5, 0);
  const sp = secG.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i);
    const top = hMount(x, 0);
    if (y > top) sp.setY(i, top);
  }
  const section = new THREE.Mesh(secG, new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.DoubleSide, toneMapped: true,
    vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: SECTION,
  }));
  section.visible = false;
  scene.add(section);

  // Gas bubbles are real spheres in front of the section, so they catch light and grow as pressure falls.
  const NB = 170;
  const bubMat = new THREE.MeshPhysicalMaterial({ color: 0xffd9a8, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.62, emissive: 0xff8430, emissiveIntensity: 0.4, clearcoat: 1 });
  const bubs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), bubMat, NB);
  bubs.frustumCulled = false; bubs.visible = false; scene.add(bubs);
  const seedB = Array.from({ length: NB }, () => [rnd(), rnd(), rnd() * 6.28, 0.4 + rnd() * 0.9]);
  const condX = (y) => 0.22 * Math.sin(y * 0.55);
  const lp = new THREE.PointLight(0xff6a22, 0, 22, 1.7);
  lp.position.set(0, -6, 2); scene.add(lp);

  // Ejecta and lava fountain use the same instanced rocks; the difference is speed and spread.
  const NE = 300;
  const emat = new THREE.MeshStandardMaterial({ color: 0x241a16, roughness: 0.9, emissive: 0xff5a10, emissiveIntensity: 2.3 });
  const ejecta = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), emat, NE);
  ejecta.frustumCulled = false; ejecta.visible = false; scene.add(ejecta);
  const seedE = Array.from({ length: NE }, () => [rnd() * 6.283, rnd(), rnd(), rnd()]);

  // volumetric overlay: plume, current, steam
  const PU = { uNoise: { value: noise }, uCam: { value: new THREE.Vector3() }, uRot: { value: new THREE.Matrix3() }, uTanF: { value: Math.tan((38 * Math.PI) / 360) }, uAspect: { value: 1080 / 1920 }, uTime: { value: 0 }, uColumn: { value: 0 }, uPDC: { value: 0 }, uSteam: { value: 0 } };
  const volRT = new THREE.WebGLRenderTarget(540, 960, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  const volScene = new THREE.Scene();
  const volCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  volScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: PU, depthTest: false, depthWrite: false, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}", fragmentShader: PLUME })));
  const over = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { t: { value: volRT.texture } }, transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: "varying vec2 vUv;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,vUv);}",
  }));
  over.frustumCulled = false; over.renderOrder = 50; scene.add(over);

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 }));
  comp.setSize(1080, 1920);
  comp.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(540, 960), 0.3, 0.6, 1.25);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  const s = K;
  const E = {
    cut: s.s1 + 2.6, hawaii: AT["s5:Hawaii"], encer: AT["s5:Magma"], kental: AT["s6:Magma"], ganas: AT["s6:ganas"], abu: AT["s6:abu"], pdc: AT["s7:aliran"],
    tekanan: AT["s4:tekanan"], gel: AT["s4:gelembung"], mengembang: AT["s4:mengembang"], soda: AT["s3:soda"],
  };
  // Camera: orbit the calm mountain; the plane slices in; dive along the section to the chamber; ride the conduit up; break out above the crater for each eruption style.
  const camT = track([
    [0, 3.2, 1.25, 25, 0, 2.4, 0],
    [s.s2 - 0.8, 1.3, 1.6, 21, 0, 1.3, 0],
    [s.s2 + 2.4, 0.6, -0.6, 19.5, 0, -2.6, 0],
    [s.s2 + 6.3, 0.2, -5.2, 14.2, 0, -6.2, 0],
    [s.s3 + 0.2, 0, -5.9, 9, 0, -6.9, 0],
    [E.soda + 1.5, -0.1, -6.6, 5.2, 0, -6.9, 0],
    [s.s4 + 0.4, 0, -6.2, 5, 0, -5.8, 0],
    [E.gel, 0.15, -3.2, 4.2, 0.1, -2.7, 0],
    [s.s4e - 0.5, 0.2, 0.9, 4.8, 0.15, 1.5, 0],
    [s.s5 - 0.05, 2.8, 2.7, 12, 0.5, 3.6, 0],
    [E.hawaii, 6.4, 2.2, 18, 1, 2.5, 0],
    [s.s5e - 0.3, 7.5, 2.1, 19, 2, 2.1, 0],
      ]);
  const camB = track([
    [s.s6 - 0.02, 0.35, 0.7, 7.2, 0.2, 1.05, 0],
    [E.ganas - 0.02, 0.2, 1.7, 3.9, 0.16, 1.7, 0],
  ]);
  const camC = track([
    [E.ganas - 0.02, 0.2, 1.6, 24, 0, 6.6, 0],
    [s.s6e, -0.6, 1.5, 36, 0, 10, 0],
    [s.s7 + 0.6, -5.5, 1.6, 27, -2.6, 3.4, 0],
    [s.s7e - 0.5, -7.5, 1.3, 23, -4.6, 2.6, 1],
    [s.s8 + 0.2, -6, 2.8, 36, 0, 8.2, 0],
    [s.end + 3, -2.4, 2.6, 46, 0, 10, 0],
  ]);
  const rot3 = new THREE.Matrix4();

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const c = t < s.s6 - 0.02 ? camT(t) : t < E.ganas - 0.02 ? camB(t) : camC(t);
    const rumble = ramp(t, E.ganas - 1.2, E.ganas) * (1 - ramp(t, E.ganas + 0.2, E.ganas + 3.2));
    const sh = rumble * 0.26 + ramp(t, E.tekanan, s.s4e) * (1 - ramp(t, s.s4e, s.s5)) * 0.03;
    cam.position.set(c[0] + Math.sin(t * 57.1) * sh * 0.6, c[1] + Math.sin(t * 47.3 + 1) * sh * 0.5, c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld();

    // slicing: only during the underground chapters, the plane sweeps from in front of the mountain to its centre
    const sliceIn = ramp(t, E.cut, s.s2 + 2);
    const sliceOut = ramp(t, s.s4e - 0.1, s.s5 + 0.02);
    const thick = t >= s.s6 - 0.02 && t < E.ganas - 0.02 ? 1 : 0;
    const open = Math.max(sliceIn * (1 - sliceOut), thick);
    const cutZ = thick ? 0 : 14 - 14 * ramp(t, E.cut, s.s2 + 2);
    clip.constant = open > 0 ? cutZ : 40;
    section.visible = open > 0.001;
    plain.visible = !section.visible;
    section.position.z = cutZ;

    const uT = t;
    SU.uTime.value = MU.uTime.value = PU.uTime.value = uT;
    SU.uChamber.value = ramp(t, s.s2 + 2.8, AT["s2:magma"] ?? s.s2 + 5);
    SU.uRise.value = thick ? 0.925 : ramp(t, E.tekanan - 3.2, s.s4e - 0.6);
    SU.uThick.value = thick;
    SU.uGasVis.value = ramp(t, E.soda - 0.8, E.soda + 0.2) * (1 - ramp(t, E.gel, E.gel + 0.7));

    // bubbles: nucleate as pressure drops; radius grows with height along the conduit, the visible rule of decompression
    const bA = thick ? 1 : ramp(t, E.gel - 0.2, E.gel + 0.7) * open;
    bubs.visible = bA > 0.01;
    if (bubs.visible) {
      const top = -5.2 + 8.25 * SU.uRise.value;
      for (let i = 0; i < NB; i++) {
        const q = seedB[i];
        const inChamber = i < 40;
        let y, x;
        if (inChamber) {
          const a = q[2], w = 2.6 * Math.sqrt(q[0]);
          x = Math.cos(a) * w; y = -7 + Math.sin(a) * 1.2 * Math.sqrt(q[0]) + ((t * 0.06 + q[1]) % 0.6);
        } else {
          y = -5.6 + ((q[1] + (t - E.gel) * 0.16 * q[3]) % 1) * 8.6;
          x = condX(y) + (q[0] - 0.5) * 0.16;
        }
        const growth = THREE.MathUtils.clamp((y + 7) / 9, 0, 1);
        const rad = (0.016 + growth * growth * 0.085) * q[3] * bA;
        const hidden = !inChamber && y > top;
        dm.position.set(x, y, section.position.z + 0.05);
        dm.scale.setScalar(hidden ? 0.0001 : rad);
        if (thick) {
          // Bubbles cannot climb through sticky magma: they crowd under the plug and swell as the pressure builds.
          const u = clamp01((t - s.s6) / (E.ganas - s.s6));
          const yy = 2.42 - Math.pow(q[1], 1.6) * 2.5;
          dm.position.set(condX(yy) + (q[0] - 0.5) * 0.2, yy + u * 0.03 * Math.sin(i), section.position.z + 0.05);
          dm.scale.setScalar((0.02 + 0.03 * q[3]) * (0.8 + u * 1.3));
        }
        dm.updateMatrix(); bubs.setMatrixAt(i, dm.matrix);
      }
      bubs.instanceMatrix.needsUpdate = true;
    }
    lp.intensity = open * SU.uChamber.value * 30;

    // effusive: flow front creeps on s5; explosive: column on s6
    MU.uFlow.value = ramp(t, E.encer, s.s5e + 0.6) * (t < s.s6 - 0.05 ? 1 : 0);
    const col = ramp(t, E.ganas, s.s7 - 0.4);
    PU.uColumn.value = col <= 0 ? 0 : 0.14 + col * 0.86;
    PU.uPDC.value = ramp(t, E.pdc - 0.6, s.s7e + 0.8);
    PU.uSteam.value = t < s.s2 - 0.6 ? 0.8 : t >= s.s5 && t < s.s6 ? 0.55 : t >= s.s6 && t < E.ganas ? 0.8 : 0;
    MU.uAsh.value = ramp(t, s.s6e, s.s7e);
    const dark = ramp(t, E.ganas + 0.5, s.s7 + 1.2);
    skyU.d.value = dark * 0.9;
    key.intensity = 2.9 - dark * 1.6;
    scene.environmentIntensity = 0.42 - dark * 0.14;

    // fountain at the vent during effusion, ballistic ejecta during the blast
    const fount = t >= E.encer - 0.3 && t < s.s6 - 0.05;
    const blast = t >= E.ganas - 0.05;
    ejecta.visible = fount || blast;
    if (ejecta.visible) {
      const dur = fount ? 2.3 : 3.4;
      const n = fount ? 170 : NE;
      for (let i = 0; i < NE; i++) {
        const q = seedE[i];
        if (i >= n) { dm.scale.setScalar(0.0001); dm.updateMatrix(); ejecta.setMatrixAt(i, dm.matrix); continue; }
        const u = (((t - (fount ? E.encer : E.ganas)) / dur + q[1]) % 1);
        const vy = fount ? 1.4 + q[2] * 1.2 : 1.8 + q[2] * 3.6;
        const vh = fount ? 0.1 + q[3] * 0.25 : 0.2 + q[3] * 1.15;
        const tt = u * dur;
        const y = 2.65 + vy * tt - 0.5 * (fount ? 1.15 : 2.1) * tt * tt;
        dm.position.set(Math.cos(q[0]) * vh * tt, y, Math.sin(q[0]) * vh * tt);
        dm.rotation.set(q[1] * 6 + t, q[2] * 6, q[3] * 6 + t * 0.7);
        const size = (fount ? 0.016 : 0.022) * (0.6 + q[3] * 1.5);
        dm.scale.setScalar(y < 0.2 ? 0.0001 : size);
        dm.updateMatrix(); ejecta.setMatrixAt(i, dm.matrix);
      }
      ejecta.instanceMatrix.needsUpdate = true;
      emat.emissiveIntensity = fount ? 7 : 3.4;
    }

    PU.uCam.value.copy(cam.position);
    PU.uRot.value.setFromMatrix4(rot3.extractRotation(cam.matrixWorld));
    over.visible = PU.uColumn.value > 0 || PU.uPDC.value > 0 || PU.uSteam.value > 0;
    if (over.visible) { r.setRenderTarget(volRT); r.setClearColor(0, 0); r.clear(); r.render(volScene, volCam); r.setRenderTarget(null); }
    bloom.strength = 0.26 + open * 0.06 + rumble * 0.22;
    comp.render();
  };
}
