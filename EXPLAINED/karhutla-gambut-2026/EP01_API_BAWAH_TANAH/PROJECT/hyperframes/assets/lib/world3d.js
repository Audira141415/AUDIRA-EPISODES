// API BAWAH TANAH. One burnt peat landscape shown three ways: from the ground at night, as a sliced section, and as a false-colour thermal pass; plus a smoke map of Indonesia.
// Mechanism follows BNPB and Kompas/IABI: dry peat smoulders below a surface that looks out, burned layers leave a cavity, the ground subsides, water must reach the ember.
// Section depth is not to scale and the panels say so. The surface is a reconstruction, not the viral footage.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, track, volumeNoise, noiseGLSL, std, cyl, box } from "./lib3d.js";
import LAND from "./land.js";

// ---------- ground height, baked once so vertex shaders for terrain and section agree ----------
function vnoise(seed) {
  const rnd = mulberry(seed), N = 64, g = new Float32Array(N * N);
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  const f = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const a = g[((ix & 63) + (iy & 63) * N)], b = g[(((ix + 1) & 63) + (iy & 63) * N)];
    const c = g[((ix & 63) + ((iy + 1) & 63) * N)], d = g[(((ix + 1) & 63) + ((iy + 1) & 63) * N)];
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x, y) => f(x, y) * 0.55 + f(x * 2.1 + 9, y * 2.1) * 0.28 + f(x * 4.7, y * 4.7 + 3) * 0.17;
}
const n1 = vnoise(404);
const GS = 60; // ground size in world units
const groundH = (x, z) => (n1(x * 0.32 + 40, z * 0.32 + 40) - 0.5) * 0.55 + (n1(x * 2.1 + 7, z * 2.1) - 0.5) * 0.09;

const COMMON = `
uniform sampler2D uH;
uniform float uSub, uCanal;
float groundY(vec2 p){
  float h=texture2D(uH,p/${GS.toFixed(1)}+.5).r;
  float r=length(p);
  h-=uSub*(.82*exp(-r*r/.85)+.16*exp(-r*r/5.5));   // burned layers gone: the ground falls in over the hole
  h-=uCanal*1.15*smoothstep(.55,.32,abs(p.x-2.35));  // drainage canal running along z
  return h;
}`;

const TERRAIN_V = `${COMMON}
varying vec3 vW; varying float vR;
void main(){vec3 p=position;p.y=groundY(p.xz);vW=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;

const TERRAIN_F = `precision highp float;
varying vec3 vW;
uniform float uTime,uCut,uHole,uBoil,uWet,uFog,uScan,uThermal,uEmberLift,uDawn,uRein;
uniform vec3 uHaze,uCam;
uniform vec4 uFires[5];
${noiseGLSL}
float hAt(vec2 p){return nB(vec3(p*.34,.21))*.6+nC(vec3(p*.92,.47))*.4;}
vec3 hot(float u){return mix(mix(vec3(.03,.03,.16),vec3(.45,.03,.42),smoothstep(0.,.35,u)),mix(vec3(1.2,.28,.03),vec3(2.4,2.,.7),smoothstep(.72,1.,u)),smoothstep(.35,.72,u));}
void main(){
  if(vW.z>uCut) discard;
  vec2 p=vW.xz;float r=length(p);
  float e=.035;float h0=hAt(p),hx=hAt(p+vec2(e,0.)),hz=hAt(p+vec2(0.,e));
  vec3 n=normalize(cross(dFdy(vW),dFdx(vW)));
  if(n.y<0.)n=-n;
  n=normalize(n+vec3(h0-hx,0.,h0-hz)*2.6);
  // char and pale ash: burnt peat is black with grey drifts
  float ash=smoothstep(.42,.66,nA(vec3(p*.11,.4))*.6+h0*.5);
  vec3 alb=mix(vec3(.02,.017,.015),vec3(.2,.18,.165),ash*.8);
  alb*=.6+h0*1.1;
  // wet ground goes dark and glossy
  alb*=1.-uWet*.55;
  vec3 L=normalize(vec3(.35,.7,.45));
  vec3 V=normalize(uCam-vW);
  float dl=max(dot(n,L),0.)*.5+.5;
  vec3 amb=mix(vec3(.5,.26,.12),vec3(.5,.56,.6),uDawn);
  vec3 c=alb*amb*dl*(.62+uDawn*.9);
  float spec=pow(max(dot(reflect(-L,n),V),0.),60.)*uWet*.8;
  c+=uHaze*spec;
  // hole: a mouth of red embers, cracks radiating from it
  float t=uTime;
  float w=nA(vec3(p*.42,t*.012))-.5;
  float rr=r+w*.9;
  float pit=smoothstep(1.16,.42,rr)*uHole;
  float q=fbm3(vec3(p*.62,t*.03)+vec3(0.,-t*.02,0.));
  float lava=smoothstep(.43,.62,q);
  vec3 em=mix(vec3(.06,.012,.006),vec3(2.0,.36,.03),lava);
  em=mix(em,vec3(2.9,1.15,.2),smoothstep(.6,.72,q));
  c=mix(c,em,pit);
  float crack=1.-smoothstep(.0,.028+.03*uHole*exp(-r*.45),abs(nA(vec3(p*.17,.77))-.5)*.5+abs(nC(vec3(p*.47,.23))-.5)*.14);
  float reach=exp(-max(r-.9,0.)*.95)*uEmberLift;
  c+=vec3(1.7,.32,.03)*crack*reach*(1.-pit)*(.6+.4*sin(t*1.3+p.x*2.+p.y*3.));
  // reddish light spilling from the pit
  c+=alb*vec3(2.4,.62,.12)*exp(-max(r-.7,0.)*1.3)*uHole;
  // boil: pale steam blisters where the water hits
  if(uBoil>0.){
    vec2 g=p*5.4+vec2(sin(t*.8),cos(t*.7))*.15;
    float bl=nB(vec3(g*.14,t*.26));
    c+=vec3(.9,.8,.72)*smoothstep(.66,.82,bl)*uBoil*smoothstep(1.3,.2,r);
  }
  // re-ignited patches on the landscape
  for(int i=0;i<5;i++){
    vec4 f=uFires[i];
    if(f.w<=0.) continue;
    float d=length(p-f.xy);
    float m=fbm3(vec3(p*.75,t*.05));
    c+=mix(vec3(1.6,.18,.02),vec3(3.,.9,.1),smoothstep(.34,.6,m))*smoothstep(f.z,f.z*.3,d+m*.5)*f.w;
    c+=alb*vec3(5.,1.5,.3)*exp(-d*.6)*f.w;
  }
  // thermal pass: right of the scan edge shows what the sensor sees
  if(uThermal>0.){
    float blob=exp(-((p.x*p.x)/6.+(p.y*p.y)/3.5))*(.75+.25*q);
    float blob2=exp(-(pow(p.x+3.1,2.)+pow(p.y-2.4,2.))/2.2)*.6*(.7+.3*q);
    float u=clamp(.06+max(blob,blob2)*1.05+(h0-.5)*.16,0.,1.);
    vec3 th=hot(u);
    float side=smoothstep(uScan-.05,uScan+.05,vW.x);
    c=mix(c,th*.82,side*uThermal);
    c+=vec3(1.1,1.6,1.8)*exp(-abs(vW.x-uScan)*16.)*uThermal*.9;
  }
  float dist=length(uCam-vW);
  float fog=1.-exp(-dist*uFog);
  c=mix(c,uHaze,fog);
  gl_FragColor=vec4(c,1.);
}`;

// ---------- the section plane: layered peat, water table, ember front, cavity, injected water ----------
const SECTION_V = `${COMMON}
uniform float uCut;
varying vec2 vS;varying float vTop;
void main(){vec3 p=position;float top=groundY(vec2(p.x,uCut));float yy=mix(-20.,top,uv.y);vS=vec2(p.x,yy);vTop=top;gl_Position=projectionMatrix*modelViewMatrix*vec4(p.x,yy,uCut,1.);}`;

const SECTION_F = `precision highp float;
varying vec2 vS;varying float vTop;
uniform float uTime,uWT,uFront,uCav,uOpen,uInject,uKill,uFog,uCanal,uLabel;
uniform vec3 uHaze,uPipes;
${noiseGLSL}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float cavity(vec2 p){
  // burned pocket spreading both ways, thinning towards the front
  float L=uFront;
  float n=(nA(vec3(p*.21,.33))-.5)*.5;
  float cx=clamp(p.x,-L,L);
  float th=.62*(1.-.72*pow(abs(cx)/max(L,.35),2.2));
  float d=length(vec2(p.x-cx,(p.y+1.05+n*.4)/1.0))-th*uCav;
  // shaft up to the surface once the roof falls in
  float sh=max(abs(p.x+n*.25)-(.62*uOpen),p.y-(vTop+.2));
  sh=max(sh,-(p.y+1.1));
  if(uOpen>0.) d=smin(d,sh,.22);
  return d+n*.1;
}
void main(){
  vec2 p=vS;float t=uTime;
  float depth=vTop-p.y;
  float warp=(nA(vec3(p*.06,.3))-.5)*1.2;
  float y=p.y+warp*.5;
  // sub-horizontal peat bedding with woody fibres
  float beds=nC(vec3(p.x*.016,y*.52,.11));
  float fib=nB(vec3(p.x*.1,y*1.5,.57));
  float wood=smoothstep(.72,.82,nA(vec3(p.x*.045,y*.65,.91)));
  vec3 dry=mix(vec3(.13,.075,.04),vec3(.3,.185,.1),smoothstep(.3,.72,beds));
  float fine=nB(vec3(p.x*.42,y*3.4,.23))*.6+nC(vec3(p.x*.9,y*6.5,.71))*.4;
  dry*=.42+fib*.62+fine*.62;
  dry=mix(dry,vec3(.075,.04,.02),wood*.8);
  vec3 c=dry;
  // root mat
  c=mix(vec3(.06,.05,.04),c,smoothstep(.0,.24,depth+(fib-.5)*.2));
  // mineral clay at the base of the peat dome
  float clay=smoothstep(-5.35,-5.1,p.y+(beds-.5)*.7);
  float cy=1.-clay;
  vec3 mud=mix(vec3(.045,.042,.04),vec3(.1,.094,.085),nB(vec3(p.x*.2,p.y*.6,.1)));
  mud*=.7+nC(vec3(p*1.1,.4))*.6;
  c=mix(mud,c,clay);
  // water table: everything below it is dark, saturated, faintly cool
  float wtl=uWT+(nC(vec3(p.x*.1,t*.03,.5))-.5)*.14;
  float wet=smoothstep(wtl+.04,wtl-.06,p.y);
  vec3 sat=mix(c*.38,vec3(.015,.065,.09),.42);
  sat*=.5+fine*.9;
  c=mix(c,sat,wet*clay);
  c+=vec3(.25,1.1,1.5)*exp(-abs(p.y-wtl)*22.)*.46*clay;
  // cracks in the dry zone open as the water table falls
  float dz=1.-wet;
  float cr=1.-smoothstep(.0,.05,abs(nC(vec3(p.x*.55,p.y*.07,.72))-.5));
  c*=1.-cr*dz*.55*smoothstep(.45,.62,nA(vec3(p*.13,.31)));
  // injected water spreading from three pipe tips
  float inj=0.;
  float xs[3];xs[0]=uPipes.x;xs[1]=uPipes.y;xs[2]=uPipes.z;
  for(int i=0;i<3;i++){
    vec2 q=(p-vec2(xs[i],-1.55))/vec2(1.05,1.25);
    float nn=(nA(vec3(p*.3,t*.05+float(i)))-.5)*.55;
    inj=max(inj,smoothstep(uInject*1.5+.02,uInject*1.5-.32,length(q)+nn));
  }
  inj*=step(.001,uInject);
  c=mix(c,mix(c*.3,vec3(.012,.06,.085),.55)*(.55+fine*.9),inj);
  c+=vec3(.15,.75,1.05)*exp(-pow((inj-.5)/.2,2.))*.06;
  // cavity and ember rim
  float d=cavity(p);
  float cav=smoothstep(.03,-.02,d);
  float flick=fbm3(vec3(p*.46,t*.05));
  float ember=(1.-uKill)*(1.-inj*.95);
  vec3 emberC=mix(vec3(.55,.04,.005),vec3(2.8,.7,.07),smoothstep(.3,.62,flick));
  emberC=mix(emberC,vec3(3.2,1.7,.45),smoothstep(.58,.74,flick));
  float rim=exp(-max(d,0.)*8.5)*(1.-cav);
  // the front itself is the brightest part of the pocket
  float fr=exp(-pow((abs(p.x)-uFront)/.38,2.))*step(.01,uCav);
  c=mix(c,vec3(.012,.01,.01),cav);
  c+=emberC*(rim*(.5+fr*1.5)*(.45+.55*smoothstep(.34,.6,flick))+cav*(.012+.13*smoothstep(.52,.72,flick)))*ember*step(.001,uCav);
  c+=vec3(1.,.12,.01)*exp(-max(d,0.)*2.6)*.09*ember*step(.001,uCav)*(1.-wet);
  float dist=14.;
  c=mix(c,uHaze,(1.-exp(-dist*uFog*.35))*.25);
  gl_FragColor=vec4(c,1.);
}`;

// ---------- volumetric smoke ----------
const VOL_V = `varying vec2 vU;void main(){vU=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const VOL_F = `precision highp float;
varying vec2 vU;
uniform vec3 uCam;uniform mat3 uRot;uniform float uTime,uAsp,uTan,uPlume,uHazeD,uFloor,uCutZ,uSteam;
uniform vec3 uTint;uniform vec4 uFires[5];
${noiseGLSL}
float plume(vec3 p,vec2 c,float w,float tilt,float t){
  vec3 q=p-vec3(c.x+p.y*tilt+sin(p.y*.42+t*.1)*.3*smoothstep(.2,3.5,p.y),0.,c.y);
  float R=w*(.4+p.y*.34);
  float r=length(q.xz);
  float base=smoothstep(R,R*.25,r)*smoothstep(-.1,.3,p.y)*smoothstep(15.,5.,p.y);
  if(base<=.001) return 0.;
  vec3 a=vec3(q.x*.1,(p.y-t*.55)*.06,q.z*.1);
  float n=nA(a)*.68+nC(a*2.3)*.32;
  return smoothstep(.36,.56,n+base*.28-.17)*base;
}
float dens(vec3 p,float t,out float hot){
  hot=0.;
  float d=0.;
  if(uPlume>0.){float pl=plume(p,vec2(0.,0.),1.,.11,t)*uPlume;d+=pl;hot=max(hot,exp(-p.y*.55)*pl);}
  if(uSteam>0.){vec3 q=p;float r=length(q.xz);float s=smoothstep(1.6,.2,r)*smoothstep(3.6,.1,p.y);float n=nB(vec3(p.x*.2,(p.y-t*1.1)*.15,p.z*.2));d+=smoothstep(.33,.66,n)*s*uSteam*1.6;}
  for(int i=0;i<5;i++){vec4 f=uFires[i];if(f.w>0.01){float pl=plume(p,f.xy,.5,.07,t+float(i)*3.)*f.w*.8;d+=pl;hot=max(hot,exp(-p.y*.8)*pl);}}
  if(uHazeD>0.){
    float n=nA(vec3(p.x*.018+t*.006,p.y*.05,p.z*.018))*.7+nC(vec3(p*.05))*.3;
    d+=uHazeD*smoothstep(.3,.7,n)*smoothstep(11.,1.2,p.y)*.24;
  }
  return d;
}
void main(){
  vec2 uvv=(vU*2.-1.)*vec2(uAsp*uTan,uTan);
  vec3 rd=normalize(uRot*vec3(uvv,-1.));
  vec3 ro=uCam;
  float tmax=62.;
  // stop at the ground plane, and at the section wall when the world is sliced
  if(rd.y<-.0001){float h=(uFloor-ro.y)/rd.y;if(h>0.)tmax=min(tmax,h);}
  if(rd.z<-.0001&&ro.z>uCutZ&&ro.y<1.5){float h=(uCutZ-ro.z)/rd.z;vec3 q=ro+rd*h;if(q.y<0.25&&h>0.)tmax=min(tmax,h);}
  const int N=68;
  float dt=min(tmax,44.)/float(N);
  float j=hash12(gl_FragCoord.xy+fract(uTime)*91.7);
  float s=dt*j;
  vec3 acc=vec3(0.);float a=0.;
  float tm=uTime;
  for(int i=0;i<N;i++){
    vec3 p=ro+rd*s;
    if(p.y>-.2&&p.y<18.){
      float hot;float d=dens(p,tm,hot);
      if(d>.004){
        float sa=1.-exp(-d*dt*.62);
        float hl=clamp(p.y*.08,0.,1.);
        vec3 lit=mix(uTint*.42,uTint*1.25,hl);
        lit+=vec3(1.5,.3,.05)*hot*.55;
        acc+=(1.-a)*sa*lit;a+=(1.-a)*sa;
        if(a>.98)break;
      }
    }
    s+=dt;
  }
  gl_FragColor=vec4(acc,a);
}`;

// ---------- map ----------
const LON0 = 118, LAT0 = -2, DEG = 1;
const toMap = (lon, lat) => [(lon - LON0) * DEG, -(lat - LAT0) * DEG];
// Nusantara Atlas Jan-Sep 2026, ha burned, largest five (Betahita). Dots at approximate province centres.
const PROV = [
  { lon: 104.4, lat: -3.2, ha: 170775 }, { lon: 110.6, lat: -0.6, ha: 277127 }, { lon: 113.4, lat: -2.0, ha: 220330 },
  { lon: 121.3, lat: -9.3, ha: 223193 }, { lon: 139.6, lat: -7.3, ha: 319120 },
];

function landTexture() {
  const W = 3072, H = 3072, X0 = -36, X1 = 36, Z0 = -36, Z1 = 36;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#04080c"; g.fillRect(0, 0, W, H);
  const P = (r) => { const [x, z] = toMap(r[0], r[1]); return [(x - X0) / (X1 - X0) * W, (z - Z0) / (Z1 - Z0) * H]; };
  const trace = (ring) => { g.beginPath(); ring.forEach((pt, i) => { const [x, y] = P(pt); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
  LAND.other.forEach((r) => { trace(r); g.fillStyle = "#26282a"; g.fill(); });
  LAND.id.forEach((r) => { trace(r); g.fillStyle = "#5a4a36"; g.fill(); g.strokeStyle = "#d4a56a"; g.lineWidth = 2.2; g.stroke(); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

const MAP_F = `precision highp float;
varying vec2 vUv;varying vec3 vW;
uniform sampler2D uMap;uniform float uTime,uSmoke,uDots;uniform vec3 uCamM,uFogM;
uniform vec4 uProv[5];
${noiseGLSL}
void main(){
  vec2 p=vW.xz;float t=uTime;
  vec2 uu=vec2((p.x+36.)/72.,1.-(p.y+36.)/72.);
  vec3 c=pow(texture2D(uMap,clamp(uu,.001,.999)).rgb,vec3(1.6));
  if(uu.x<0.||uu.x>1.||uu.y<0.||uu.y>1.)c=pow(vec3(.016,.031,.047),vec3(1.6));
  float heat=0.;
  for(int i=0;i<5;i++){
    vec4 f=uProv[i];float a=clamp(uDots*5.-float(i),0.,1.);
    float d=length(p-f.xy);
    float R=f.z*a;
    float ring=exp(-d*d/(R*R+.001));
    heat=max(heat,ring);
    float q=nA(vec3(p*.09,t*.02));
    c+=vec3(2.6,.42,.05)*smoothstep(.45,.1,d/(R+.001)+(q-.5)*.5)*a;
    c+=vec3(1.5,.2,.03)*ring*.2*a;
  }
  // smoke sheet driven westward by the monsoon, thick over the burning provinces
  vec3 q=vec3(p*.018+vec2(t*.008,t*.002),t*.012);
  float n=fbm3(q)*.72+nB(q*2.7)*.28;
  float spread=smoothstep(.0,1.,uSmoke);
  float mass=smoothstep(.42-.26*spread,.72-.2*spread,n+heat*.35);
  float along=smoothstep(17.,3.,abs(p.y+1.5+(n-.5)*12.))*smoothstep(40.,16.,abs(p.x));
  float a=mass*along*spread*.6;
  vec3 smoke=mix(vec3(.2,.13,.07),vec3(.62,.44,.24),n);
  c=mix(c,smoke,a);
  float dist=length(vW-uCamM);
  c=mix(c,uFogM,1.-exp(-dist*.0042));
  gl_FragColor=vec4(c,1.);
}`;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.05, 700);
  scene.add(cam);
  const rnd = mulberry(1210);
  const noise = volumeNoise(64, 43);

  // ground height texture
  const HN = 512, hd = new Float32Array(HN * HN);
  for (let j = 0; j < HN; j++) for (let i = 0; i < HN; i++) hd[i + j * HN] = groundH((i / HN - 0.5) * GS, (j / HN - 0.5) * GS);
  const hTex = new THREE.DataTexture(hd, HN, HN, THREE.RedFormat, THREE.FloatType);
  hTex.minFilter = hTex.magFilter = THREE.LinearFilter;
  hTex.wrapS = hTex.wrapT = THREE.ClampToEdgeWrapping;
  hTex.needsUpdate = true;
  const groundJS = (x, z) => groundH(x, z);

  const hazeV = new THREE.Color();
  const FIRES = [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()];
  const U = {
    uH: { value: hTex }, uNoise: { value: noise }, uTime: { value: 0 }, uSub: { value: 1 }, uCanal: { value: 0 }, uCut: { value: 99 },
    uHole: { value: 1 }, uBoil: { value: 0 }, uWet: { value: 0 }, uFog: { value: 0.02 }, uScan: { value: 99 }, uThermal: { value: 0 }, uEmberLift: { value: 1 },
    uDawn: { value: 0 }, uRein: { value: 0 }, uHaze: { value: hazeV }, uCam: { value: new THREE.Vector3() }, uFires: { value: FIRES },
    uWT: { value: -0.5 }, uFront: { value: 0.3 }, uCav: { value: 0 }, uOpen: { value: 0 }, uInject: { value: 0 }, uKill: { value: 0 }, uLabel: { value: 0 },
    uPipes: { value: new THREE.Vector3(-1.45, 0, 1.45) },
  };

  const tg = new THREE.PlaneGeometry(GS, GS, 620, 620);
  tg.rotateX(-Math.PI / 2);
  const terrain = new THREE.Mesh(tg, new THREE.ShaderMaterial({ uniforms: U, vertexShader: TERRAIN_V, fragmentShader: TERRAIN_F, side: THREE.DoubleSide }));
  terrain.frustumCulled = false;
  scene.add(terrain);

  const sg = new THREE.PlaneGeometry(GS, 1, 620, 1);
  const section = new THREE.Mesh(sg, new THREE.ShaderMaterial({ uniforms: U, vertexShader: SECTION_V, fragmentShader: SECTION_F, side: THREE.DoubleSide }));
  section.frustumCulled = false;
  scene.add(section);

  // canal water
  const canalW = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.5, 30), std(0x0b2a33, 0.1, 0.1, { emissive: 0x124f60, emissiveIntensity: 0.65 }));
  canalW.position.set(2.35, -1.2, -15.01);
  scene.add(canalW);
  // canal block (sekat)
  const gate = box(1.0, 1.15, 0.2, std(0x8a7350, 0.9, 0, { emissive: 0x3a2e1c, emissiveIntensity: 0.7 }), 2.35, 3, 0.12, scene);
  gate.visible = false;

  // lights for props
  const hemi = new THREE.HemisphereLight(0x8a6a48, 0x120a06, 0.45);
  scene.add(hemi);
  const emberL = new THREE.PointLight(0xff5a18, 14, 26, 1.8);
  emberL.position.set(0, 0.5, 0);
  scene.add(emberL);
  const rimL = new THREE.DirectionalLight(0xffc98a, 0.9);
  rimL.position.set(-7, 5, -9);
  scene.add(rimL);

  // dead standing trunks and fallen logs: all charred, some with ember seams
  const charM = std(0x0b0908, 0.92);
  const seamM = std(0x0d0806, 0.9);
  const trees = new THREE.Group();
  scene.add(trees);
  for (let i = 0; i < 70; i++) {
    let x = (rnd() - 0.5) * 42, z = -rnd() * 26 + 6;
    if (Math.hypot(x, z) < 4.2) { x += Math.sign(x || 1) * 4; z -= 3; }
    if (Math.abs(x - 2.35) < 0.8) x += 1.6;
    const H = 1.8 + rnd() * 4.8, R = 0.05 + rnd() * 0.1;
    const tr = cyl(R * 0.32, R, H, 7, charM, x, groundJS(x, z) + H / 2 - 0.05, z, trees);
    tr.rotation.set((rnd() - 0.5) * 0.14, rnd() * 6, (rnd() - 0.5) * 0.14);
    tr.castShadow = false;
    const brN = 1 + Math.floor(rnd() * 3);
    for (let b = 0; b < brN; b++) {
      const L = 0.35 + rnd() * 1.1;
      const br = cyl(R * 0.1, R * 0.35, L, 5, charM, 0, 0, 0, tr);
      const a = rnd() * 6.28, lean = 0.6 + rnd() * 0.7;
      br.position.set(Math.cos(a) * L * 0.42 * Math.sin(lean), H * (0.05 + rnd() * 0.42) + L * 0.3, Math.sin(a) * L * 0.42 * Math.sin(lean));
      br.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean);
    }
  }
  const log1 = cyl(0.13, 0.2, 4.6, 16, seamM, 1.95, 0.04, -2.4, scene); log1.rotation.set(0.1, 0.3, 1.5);
  const log2 = cyl(0.08, 0.14, 3.0, 8, charM, -2.2, 0.03, 0.7, scene); log2.rotation.set(0.25, 1.1, 1.53);
  const log3 = cyl(0.07, 0.11, 2.3, 12, charM, -3.3, 0.0, -1.4, scene); log3.rotation.set(1.42, 0.4, 0.1);

  // volunteers: helmet, jacket with reflective band, hose held forward
  const figures = new THREE.Group();
  scene.add(figures);
  const jacket = std(0x2a1a10, 0.9), helmet = std(0xd6a230, 0.42), band = std(0x8f8f82, 0.5, 0, { emissive: 0x4a4a40, emissiveIntensity: 0.28 }), skin = std(0x2a1a12, 0.9), hoseM = std(0x8a2a16, 0.6);
  function person(x, z, yaw, s) {
    const g = new THREE.Group();
    g.position.set(x, groundJS(x, z) + 0.03, z);
    g.rotation.y = yaw; g.scale.setScalar(s);
    const legL = cyl(0.075, 0.09, 0.82, 8, skin, -0.1, 0.41, 0, g); legL.rotation.x = 0.17;
    const legR = cyl(0.075, 0.09, 0.82, 8, skin, 0.1, 0.41, 0.03, g); legR.rotation.x = -0.2;
    cyl(0.19, 0.17, 0.66, 10, jacket, 0, 1.13, 0, g);
    cyl(0.195, 0.195, 0.035, 10, band, 0, 1.08, 0, g);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), skin); head.position.set(0, 1.58, 0); g.add(head);
    const hel = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 8, 0, 6.3, 0, 1.7), helmet); hel.position.set(0, 1.6, 0); g.add(hel);
    const ar = cyl(0.045, 0.05, 0.56, 7, jacket, 0.2, 1.17, 0.17, g); ar.rotation.x = 0.75;
    const al = cyl(0.045, 0.05, 0.56, 7, jacket, -0.2, 1.14, 0.19, g); al.rotation.x = 0.85;
    figures.add(g);
    return g;
  }
  const P1 = person(1.7, 1.2, -2.2, 1), P2 = person(1.95, -1.25, -0.9, 1), P3 = person(-1.8, -1.05, 0.95, 1), P4 = person(-2.3, -2.5, 0.75, 1);
  const hoseCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(1.42, 1.05, 0.95), new THREE.Vector3(2.3, 0.2, 1.6), new THREE.Vector3(4.2, 0.04, 2.6), new THREE.Vector3(8, 0.05, 2.6)]);
  figures.add(new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 40, 0.03, 7), hoseM));

  const softC = document.createElement("canvas");
  softC.width = softC.height = 64;
  { const g = softC.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  const soft = new THREE.CanvasTexture(softC);
  // water jet: points on a parabola, pure function of t
  const NJ = 4200, jg = new THREE.BufferGeometry(), jp = new Float32Array(NJ * 3), js = [];
  for (let i = 0; i < NJ; i++) js.push([rnd(), rnd(), rnd(), rnd()]);
  jg.setAttribute("position", new THREE.BufferAttribute(jp, 3));
  const jet = new THREE.Points(jg, new THREE.PointsMaterial({ map: soft, color: 0xbfe4f5, size: 0.022, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  jet.frustumCulled = false;
  scene.add(jet);

  // mud bubbles
  const NB = 90, bg = new THREE.SphereGeometry(1, 14, 10);
  const bub = new THREE.InstancedMesh(bg, new THREE.MeshStandardMaterial({ color: 0x0c0705, roughness: 0.2, metalness: 0.05, emissive: 0xff4a10, emissiveIntensity: 0.05 }), NB);
  bub.frustumCulled = false;
  const bs = [];
  for (let i = 0; i < NB; i++) { const a = rnd() * 6.28, rr = Math.sqrt(rnd()) * 1.0; bs.push([Math.cos(a) * rr, Math.sin(a) * rr, rnd(), 0.02 + rnd() * rnd() * 0.075, 0.6 + rnd() * 1.1]); }
  scene.add(bub);
  const dm = new THREE.Object3D();

  // embers
  const NE = 500, eg = new THREE.BufferGeometry(), ep = new Float32Array(NE * 3), es = [];
  for (let i = 0; i < NE; i++) es.push([rnd(), rnd(), rnd(), rnd()]);
  eg.setAttribute("position", new THREE.BufferAttribute(ep, 3));
  const embers = new THREE.Points(eg, new THREE.PointsMaterial({ map: soft, color: 0xff8a30, size: 0.03, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  embers.frustumCulled = false;
  scene.add(embers);

  // rain streaks
  const NR = 2600, rg = new THREE.BufferGeometry(), rainP = new Float32Array(NR * 6), rs = [];
  for (let i = 0; i < NR; i++) rs.push([rnd(), rnd(), rnd(), rnd()]);
  rg.setAttribute("position", new THREE.BufferAttribute(rainP, 3));
  const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xbfd6e4, transparent: true, opacity: 0.32, depthWrite: false }));
  rain.frustumCulled = false;
  scene.add(rain);

  // injection pipes and bore well
  const pipeM = std(0xaab2b6, 0.45, 0.15, { emissive: 0x3a4246, emissiveIntensity: 0.55 });
  const pipes = [-1.45, 0, 1.45].map((x) => { const p = cyl(0.055, 0.055, 2.4, 12, pipeM, x, 3, 0.03, scene); p.visible = false; return p; });
  const well = cyl(0.11, 0.11, 2.8, 14, std(0x5a8c9c, 0.45, 0.15, { emissive: 0x1f4450, emissiveIntensity: 0.6 }), -2.2, 3, 0.03, scene);
  well.visible = false;

  // drone over the thermal pass
  const drone = new THREE.Group();
  const dBody = std(0x1b1c1e, 0.34, 0.6), dLens = std(0x081018, 0.1, 0.9, { emissive: 0xff5a10, emissiveIntensity: 1.2 });
  box(0.3, 0.09, 0.18, dBody, 0, 0, 0, drone);
  const dl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), dLens); dl.position.set(0, -0.08, 0.05); drone.add(dl);
  const rotors = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
    const arm = box(0.3, 0.018, 0.02, dBody, a * 0.14, 0.03, b * 0.1, drone); arm.rotation.y = -a * b * 0.62;
    const rt = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.004, 24), new THREE.MeshBasicMaterial({ color: 0xc9d0d4, transparent: true, opacity: 0.22, depthWrite: false }));
    rt.position.set(a * 0.25, 0.06, b * 0.18); drone.add(rt); rotors.push(rt);
  });
  scene.add(drone);

  // flames at re-ignited patches
  const FL = `varying vec2 vU;uniform float uTime,uA,uS;${noiseGLSL}void main(){float y=vU.y;float x=vU.x-.5;float t=uTime;float n=fbm3(vec3(x*.3+uS,(y-t*1.05)*.2,uS*.17));float n2=nB(vec3(x*.8+uS,(y-t*1.6)*.42,uS*.3));float wob=(n-.5)*.62*y;float w=.42*pow(1.-y,.72)+.012;float body=1.-abs(x+wob)/w;float m=smoothstep(0.,.42,body+(n2-.55)*1.1*y)*smoothstep(.0,.2,y)*smoothstep(.98,.5,y+(n-.5)*.6);vec3 c=mix(vec3(.85,.12,.015),vec3(1.5,.5,.07),smoothstep(.2,.8,m*(1.-y*.7)));gl_FragColor=vec4(c*m*uA,m*uA*.7);}`;
  const flames = [];
  const FIREPOS = [[-1.5, -4.2], [1.6, -5.4], [0.1, -8.6], [-2.8, -11.5], [3.2, -12.5]];
  FIREPOS.forEach((q, i) => {
    for (let k = 0; k < 7; k++) {
      const u = { uTime: U.uTime, uA: { value: 0 }, uS: { value: i * 3.1 + k * 7.7 }, uNoise: U.uNoise };
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.5), new THREE.ShaderMaterial({ uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "precision highp float;" + FL }));
      const ox = (k - 3) * 0.3 + (i % 2 ? 0.1 : -0.08), oz = (k % 3) * 0.2;
      const fs = 0.5 + 0.32 * ((i * 3 + k * 5) % 4) / 3;
      f.position.set(q[0] + ox, groundJS(q[0] + ox, q[1] + oz) + 1.25 * fs - 0.12, q[1] + oz);
      f.scale.setScalar(fs);
      f.visible = false;
      f.userData = { i, u };
      scene.add(f);
      flames.push(f);
    }
  });

  // sky dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: new THREE.Color() }, b: { value: new THREE.Color() } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec3 v;uniform vec3 a,b;void main(){float y=clamp(normalize(v).y,0.,1.);gl_FragColor=vec4(mix(b,a,pow(y,.6)),1.);}",
  }));
  scene.add(sky);

  // map scene
  const mapScene = new THREE.Scene();
  const mapU = { uMap: { value: landTexture() }, uTime: U.uTime, uSmoke: { value: 0 }, uDots: { value: 0 }, uCamM: { value: new THREE.Vector3() }, uFogM: { value: new THREE.Color(0x1a120a) }, uNoise: { value: noise }, uProv: { value: PROV.map((q) => { const [x, z] = toMap(q.lon, q.lat); return new THREE.Vector4(x, z, 0.75 + (q.ha / 319120) * 1.7, 0); }) } };
  const mapMesh = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.ShaderMaterial({
    uniforms: mapU, fragmentShader: MAP_F,
    vertexShader: "varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
  }));
  mapMesh.rotation.x = -Math.PI / 2;
  mapScene.add(mapMesh);
  mapScene.background = new THREE.Color(0x1a120a);

  // volumetric overlay rendered into its own buffer and composited
  const volRT = new THREE.WebGLRenderTarget(720, 1280, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false });
  const VU = {
    uNoise: { value: noise }, uCam: U.uCam, uRot: { value: new THREE.Matrix3() }, uTime: U.uTime, uAsp: { value: 1080 / 1920 }, uTan: { value: Math.tan((38 / 2) * Math.PI / 180) },
    uPlume: { value: 0 }, uHazeD: { value: 0 }, uFloor: { value: -0.05 }, uCutZ: { value: 99 }, uSteam: { value: 0 }, uTint: { value: new THREE.Color() }, uFires: { value: FIRES },
  };
  const volMat = new THREE.ShaderMaterial({ uniforms: VU, vertexShader: VOL_V, fragmentShader: VOL_F, depthTest: false, depthWrite: false });
  const volScene = new THREE.Scene();
  const fsq = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), volMat);
  fsq.frustumCulled = false;
  volScene.add(fsq);
  const volCam = new THREE.Camera();
  const over = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { t: { value: volRT.texture } }, transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: "varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: "varying vec2 u;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,u);}",
  }));
  over.frustumCulled = false;
  over.renderOrder = 999;
  scene.add(over);

  const comp = new EffectComposer(r);
  const rp = new RenderPass(scene, cam);
  comp.addPass(rp);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1080, 1920), 0.34, 0.62, 1.05);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  const veil = document.getElementById("veil");
  const rot3 = new THREE.Matrix4();
  const lp = new THREE.Vector3();
  const plv = [0, 1, 2, 3, 4].map((i) => document.getElementById("pl" + i));
  const s = K;
  const A = (k) => AT[k];

  // Camera tracks: one per chapter, all tied to narration times so they survive the voice lock.
  const T1 = track([
    [s.s1 - 0.1, 0.85, 2.15, 5.0, 0.1, 0.55, 0.0],
    [A("s1:bergolak"), 0.35, 1.6, 3.7, 0.02, 0.36, 0],
    [s.s2, -0.2, 1.65, 3.9, 0, 0.42, 0],
    [A("s2:Relawan"), -1.4, 2.0, 8.6, 0.05, 0.75, -0.2],
    [A("s2:bukan"), -1.0, 3.2, 11.4, 0.0, 0.9, -0.5],
    [s.s2e - 1.2, 0, 3.8, 7.8, 0, 0, 0],
    [s.s2e, 0, 0.95, 0.65, 0, -0.5, 0],
  ]);
  const T3 = track([
    [s.s3 - 0.1, -0.6, -1.1, 15.2, 0, -2.2, 0],
    [A("s3:Bara"), 0.3, -1.25, 14.2, 0, -2.2, 0],
    [A("s3:ambles"), 0.1, -1.0, 13.0, 0, -1.9, 0],
    [s.s3e, 0.5, -1.4, 14.6, 0.25, -2.25, 0],
    [A("s4:kanal"), 1.3, -1.7, 18.0, 1.15, -2.4, 0],
    [s.s4e, 1.5, -1.5, 16.2, 1.25, -2.15, 0],
  ]);
  const T5 = track([
    [s.s5 - 0.1, 0.1, 12.2, 8.6, 0, 0.2, -1.3],
    [A("s5:sensor"), 0.8, 13.1, 7.2, 0.45, 0.2, -1.1],
    [s.s5e, 1.2, 16.5, 7.4, 0.5, 0.2, -1.5],
  ]);
  const TM = track([
    [s.s6 - 0.1, -14, 15, 19, -14, 0, -3],
    [A("s6:juta"), -5, 15, 19, -5, 0, -3.5],
    [A("s6:sekitar"), 7, 15, 18, 7, 0, -6],
    [A("s6:Menurut") - 0.1, 20, 16, 18, 20, 0, -6],
    [A("s6:hampir"), 12, 40, 50, 7, 0, -3],
    [A("s6:orang"), 4, 62, 72, 3, 0, -2],
    [s.s6e, 3, 68, 76, 3, 0, -2],
  ]);
  const T7 = track([
    [s.s7 - 0.1, -1.1, 3.6, 7.8, -0.4, 1.0, -4],
    [A("s7:Banjar"), -0.1, 4.1, 8.1, -0.2, 1.05, -5],
    [s.s7e, 1.2, 5.4, 8.5, 0.0, 1.25, -7],
  ]);
  const T8 = track([
    [s.s8 - 0.1, -0.4, -1.1, 15.2, -0.1, -2.1, 0],
    [A("s8:disuntik"), 0.1, -1.0, 15.5, 0.15, -2.1, 0],
    [A("s8:sumur"), 0.2, -1.4, 18.2, 0.4, -2.4, 0],
    [A("s8:Api"), 0.3, -1.6, 19.2, 0.5, -2.4, 0],
    [s.end + 0.3, 0.5, -0.9, 21.6, 0.5, -1.85, 0],
  ]);

  const col = (c) => new THREE.Color(c);
  const NIGHT = { a: col(0x070504), b: col(0x3b1d0e), h: col(0x24130a), t: col(0x5f4131), f: 0.04 };
  const YEL = { a: col(0x2a1f10), b: col(0x6b4a22), h: col(0x4a3218), t: col(0xa98a5a), f: 0.006 };
  const RAIN = { a: col(0x0e1418), b: col(0x3f4f55), h: col(0x2d3a40), t: col(0x60707a), f: 0.05 };
  const DAWN = { a: col(0x24384a), b: col(0x87867a), h: col(0x5c6661), t: col(0x9a9c97), f: 0.018 };

  function setSky(m) {
    sky.material.uniforms.a.value.copy(m.a);
    sky.material.uniforms.b.value.copy(m.b);
    hazeV.copy(m.h);
    VU.uTint.value.copy(m.t);
    U.uFog.value = m.f;
  }

  return (t) => {
    U.uTime.value = t;
    let useMap = false;
    const ch = t < s.s3 ? 1 : t < s.s5 ? 3 : t < s.s6 ? 5 : t < s.s7 ? 6 : t < s.s8 ? 7 : 8;
    let v = 0, vc = "#ff6a1f"; // veil

    // reset per-frame state, then each chapter sets what it needs
    U.uSub.value = 0; U.uCanal.value = 0; U.uCut.value = 99; U.uHole.value = 0; U.uBoil.value = 0; U.uWet.value = 0; U.uThermal.value = 0; U.uScan.value = 99; U.uEmberLift.value = 0; U.uDawn.value = 0;
    U.uWT.value = -0.45; U.uFront.value = 0.2; U.uCav.value = 0; U.uOpen.value = 0; U.uInject.value = 0; U.uKill.value = 0;
    VU.uPlume.value = 0; VU.uHazeD.value = 0; VU.uSteam.value = 0; VU.uCutZ.value = 99;
    FIRES.forEach((f) => f.set(0, 0, 0, 0));
    let plumeOn = false, jetOn = 0, bubOn = 0, emberOn = 0, rainOn = 0, sectionOn = false, propsOn = true, figOn = 0, droneOn = false, canalOn = 0;
    let gateY = 3, gateVis = false, pipeA = 0, wellA = 0, flameT = -1;
    let px, py, pz, lx, ly, lz;
    emberL.intensity = 0;
    rimL.intensity = 0.9;

    if (ch === 1) {
      setSky(NIGHT);
      [px, py, pz, lx, ly, lz] = T1(t);
      U.uSub.value = 1; U.uHole.value = 1; U.uEmberLift.value = 1;
      const hit = ramp(t, A("s1:Air") + 0.35, A("s1:Air") + 0.8);
      jetOn = hit;
      const b = ramp(t, A("s1:Tapi") + 0.1, A("s1:bergolak"));
      U.uBoil.value = b * (1 - ramp(t, s.s2e - 3, s.s2e - 1) * 0.7);
      bubOn = b * (1 - ramp(t, s.s2e - 1.5, s.s2e - 0.4));
      VU.uSteam.value = hit * 0.35 + b * 0.75;
      VU.uPlume.value = 0.72; VU.uHazeD.value = 0.32; plumeOn = true;
      emberOn = 1;
      figOn = 1;
      emberL.intensity = 9;
      emberL.position.set(0, 0.45, 0);
      v = ramp(t, s.s2e - 0.62, s.s2e - 0.05);
      vc = "#ff6a1f";
    } else if (ch === 3) {
      setSky(NIGHT);
      [px, py, pz, lx, ly, lz] = T3(t);
      sectionOn = true;
      const sweep = ramp(t, s.s3, s.s3 + 0.85);
      U.uCut.value = 5.6 * (1 - sweep);
      VU.uCutZ.value = U.uCut.value;
      U.uEmberLift.value = 0.4;
      const dryIn = ramp(t, A("s3:kering") - 0.2, A("s3:kering") + 0.8);
      U.uWT.value = s.s3 < t && t < s.s4 ? -0.35 - dryIn * 2.2 : -2.55;
      const a0 = A("s3:Bara");
      U.uCav.value = ramp(t, a0 - 0.1, a0 + 0.6);
      U.uFront.value = 0.15 + 1.7 * ramp(t, a0, A("s3:lapisannya"));
      const am = A("s3:ambles");
      U.uSub.value = ramp(t, am - 0.25, am + 0.35);
      U.uOpen.value = ramp(t, am - 0.05, am + 0.5);
      U.uHole.value = U.uSub.value;
      // s4: canal is cut, the water table falls further
      if (t >= s.s4) {
        canalOn = 1;
        const c = ramp(t, A("s4:kanal") - 0.5, A("s4:kanal") + 0.5);
        U.uCanal.value = c;
        U.uSub.value = 1; U.uOpen.value = 1; U.uHole.value = 1; U.uCav.value = 1; U.uFront.value = 1.85;
        U.uWT.value = -2.55 - 1.15 * ramp(t, A("s4:kanal"), s.s4e - 0.6);
      }
      VU.uPlume.value = 0.45 * U.uOpen.value; plumeOn = U.uOpen.value > 0;
      VU.uHazeD.value = 0.25;
      emberOn = U.uOpen.value * 0.7;
      emberL.intensity = 10 * U.uOpen.value;
      v = 1 - ramp(t, s.s3 + 0.02, s.s3 + 0.5);
      const out = ramp(t, s.s4e - 0.35, s.s4e - 0.02);
      if (out > 0) { v = out; vc = "#1a1009"; } else vc = "#ff6a1f";
    } else if (ch === 5) {
      setSky(YEL);
      [px, py, pz, lx, ly, lz] = T5(t);
      U.uSub.value = 0.35; U.uHole.value = 0;
      droneOn = true;
      U.uThermal.value = 1;
      U.uScan.value = 5.2 - 4.8 * ramp(t, s.s5 + 0.2, A("s5:mata")) - 5.6 * ramp(t, A("s5:sensor") - 0.3, A("s5:sensor") + 0.5);
      VU.uHazeD.value = 0.03;
      VU.uPlume.value = 0.16; plumeOn = true;
      v = (1 - ramp(t, s.s5 + 0.02, s.s5 + 0.4));
      vc = "#1a1009";
      const out = ramp(t, s.s5e - 0.35, s.s5e - 0.02);
      if (out > 0) { v = out; vc = "#d1a35a"; }
    } else if (ch === 6) {
      useMap = true;
      [px, py, pz, lx, ly, lz] = TM(t);
      cam.position.set(px, py, pz); cam.lookAt(lx, ly, lz); cam.updateMatrixWorld();
      mapU.uDots.value = ramp(t, s.s6 - 0.1, A("s6:Menurut") - 0.5);
      mapU.uSmoke.value = ramp(t, A("s6:Menurut") - 0.2, A("s6:orang") + 0.8);
      mapU.uCamM.value.copy(cam.position);
      plv.forEach((e, i) => {
        const q = PROV[i], [x, z] = toMap(q.lon, q.lat), a = clamp01(mapU.uDots.value * 5 - i);
        lp.set(x, 0, z).project(cam);
        const sx = (lp.x * 0.5 + 0.5) * 1080, sy = (0.5 - lp.y * 0.5) * 1920;
        const on = a > 0 && mapU.uSmoke.value < 0.6 && sx > 40 && sx < 900;
        e.style.opacity = on ? (a * (1 - mapU.uSmoke.value / 0.6)).toFixed(3) : 0;
        e.style.transform = `translate(${sx.toFixed(1)}px,${(sy - 24).toFixed(1)}px)`;
      });
      mapU.uProv.value.forEach((p) => { p.w = 0; });
      v = 1 - ramp(t, s.s6 + 0.02, s.s6 + 0.4);
      vc = "#d1a35a";
      const out = ramp(t, s.s6e - 0.35, s.s6e - 0.02);
      if (out > 0) { v = out; vc = "#2d3a40"; }
    } else if (ch === 7) {
      setSky(RAIN);
      [px, py, pz, lx, ly, lz] = T7(t);
      rainOn = 1 - ramp(t, A("s7:Tiga") - 0.8, A("s7:Tiga") + 0.3);
      U.uWet.value = 1 - ramp(t, A("s7:Tiga") - 0.3, A("s7:terbakar") + 0.6) * 0.72;
      U.uSub.value = 0.3;
      const dry = ramp(t, A("s7:Tiga") - 0.5, A("s7:lokasi"));
      const mix = (a, b, k) => a + (b - a) * k;
      sky.material.uniforms.a.value.lerpColors(RAIN.a, NIGHT.a, dry);
      sky.material.uniforms.b.value.lerpColors(RAIN.b, NIGHT.b, dry);
      hazeV.lerpColors(RAIN.h, NIGHT.h, dry);
      VU.uTint.value.lerpColors(RAIN.t, NIGHT.t, dry);
      U.uFog.value = mix(RAIN.f, NIGHT.f, dry);
      VU.uHazeD.value = 0.1 + dry * 0.24;
      flameT = A("s7:lima");
      FIREPOS.forEach((q, i) => {
        const a = ramp(t, flameT - 0.1 + i * 0.26, flameT + 0.22 + i * 0.26);
        FIRES[i].set(q[0], q[1], 1.05, a);
      });
      plumeOn = FIRES[0].w > 0;
      VU.uPlume.value = 0;
      emberOn = dry * 0.3;
      v = 1 - ramp(t, s.s7 + 0.02, s.s7 + 0.4);
      vc = "#2d3a40";
      const out = ramp(t, s.s7e - 0.35, s.s7e - 0.02);
      if (out > 0) { v = out; vc = "#14100c"; }
    } else {
      [px, py, pz, lx, ly, lz] = T8(t);
      const light = ramp(t, A("s8:Ia") - 0.7, s.end);
      sky.material.uniforms.a.value.lerpColors(NIGHT.a, DAWN.a, light);
      sky.material.uniforms.b.value.lerpColors(NIGHT.b, DAWN.b, light);
      hazeV.lerpColors(NIGHT.h, DAWN.h, light);
      VU.uTint.value.lerpColors(NIGHT.t, DAWN.t, light);
      U.uFog.value = 0.04 - light * 0.022;
      U.uDawn.value = light;
      sectionOn = true;
      canalOn = 1;
      U.uCut.value = 0; VU.uCutZ.value = 0;
      U.uCanal.value = 1; U.uSub.value = 1; U.uOpen.value = 1; U.uHole.value = 1 - ramp(t, A("s8:disuntik"), A("s8:Api"));
      U.uCav.value = 1; U.uFront.value = 1.85;
      U.uEmberLift.value = 0.35 * (1 - ramp(t, A("s8:disuntik"), A("s8:Api")));
      pipeA = ramp(t, A("s8:disuntik") - 0.25, A("s8:disuntik") + 0.35);
      const flow = ramp(t, A("s8:disuntik") + 0.2, A("s8:Api") + 0.4);
      U.uInject.value = flow * 1.15;
      U.uKill.value = ramp(t, A("s8:Api") - 0.6, A("s8:basah") - 0.1);
      gateVis = t >= A("s8:disekat") - 0.4;
      gateY = 3 - 3.55 * ramp(t, A("s8:disekat") - 0.3, A("s8:disekat") + 0.12);
      wellA = ramp(t, A("s8:sumur") - 0.1, A("s8:dibor") + 0.2);
      U.uWT.value = -3.7 + 3.35 * ramp(t, A("s8:Api") - 0.2, A("s8:basah") + 0.35);
      const fade = 1 - ramp(t, A("s8:Api"), A("s8:basah"));
      VU.uPlume.value = 0.38 * fade; plumeOn = fade > 0.01;
      VU.uHazeD.value = 0.2 * fade;
      emberL.intensity = 8 * fade;
      emberOn = fade * 0.5;
      v = 1 - ramp(t, s.s8 + 0.02, s.s8 + 0.4);
      vc = "#14100c";
    }

    // tiny handheld drift keeps the frame alive even on slow passages
    const dr = 0.012 * Math.min(Math.abs(pz) * 0.35, 4);
    cam.position.set(px + Math.sin(t * 0.73) * dr, py + Math.sin(t * 0.91 + 1) * dr * 0.7, pz);
    cam.lookAt(lx + Math.sin(t * 0.37) * dr * 0.6, ly, lz);
    U.uCam.value.copy(cam.position);
    cam.updateMatrixWorld();

    if (!useMap) plv.forEach((e) => { e.style.opacity = 0; });
    veil.style.background = vc;
    veil.style.opacity = clamp01(v).toFixed(3);

    if (useMap) {
      rp.scene = mapScene;
      bloom.strength = 0.42;
      bloom.threshold = 0.95;
      comp.render();
      return;
    }
    rp.scene = scene;

    section.visible = sectionOn;
    terrain.material.uniforms.uCut.value = U.uCut.value;
    trees.visible = propsOn;
    trees.children.forEach((c) => { c.visible = !sectionOn || c.position.z < -0.35; });
    figures.visible = figOn > 0.01;
    jet.visible = jetOn > 0.01;
    bub.visible = bubOn > 0.01;
    rain.visible = rainOn > 0.01;
    drone.visible = droneOn;
    canalW.visible = canalOn > 0 && U.uCanal.value > 0.5;
    if (canalW.visible) canalW.position.y = -1.27 + (ch === 8 ? 0.42 * ramp(t, A("s8:disekat"), A("s8:Api")) : 0);
    gate.visible = gateVis;
    gate.position.y = gateY - 0.3;
    log1.visible = log2.visible = log3.visible = !sectionOn;

    // pipes and well drive down from above the ground
    pipes.forEach((p, i) => {
      const a = ramp(t, (ch === 8 ? A("s8:disuntik") - 0.25 : 0) + i * 0.1, (ch === 8 ? A("s8:disuntik") + 0.3 : 0) + i * 0.1);
      p.visible = ch === 8 && a > 0;
      p.position.y = 2.4 - a * 2.75;
    });
    well.visible = ch === 8 && wellA > 0;
    well.position.y = 3.6 - wellA * 4.3;

    // water jet
    if (jet.visible) {
      const O = [1.42, 1.08, 0.95], E = [0.05, -0.55, 0.0];
      for (let i = 0; i < NJ; i++) {
        const q = js[i];
        const u = ((t * 1.35 + q[0]) % 1) * jetOn;
        const sp = 0.012 + u * u * 0.2;
        jp[i * 3] = O[0] + (E[0] - O[0]) * u + (q[1] - 0.5) * sp;
        jp[i * 3 + 1] = O[1] + (E[1] - O[1]) * u + 0.42 * Math.sin(u * Math.PI) + (q[2] - 0.5) * sp;
        jp[i * 3 + 2] = O[2] + (E[2] - O[2]) * u + (q[3] - 0.5) * sp;
      }
      jg.attributes.position.needsUpdate = true;
    }
    // bubbles swell and pop, each on its own clock
    if (bub.visible) {
      for (let i = 0; i < NB; i++) {
        const b = bs[i], u = (t * b[4] + b[2]) % 1, sw = u < 0.82 ? u / 0.82 : Math.max(0, 1 - (u - 0.82) / 0.05);
        const sc = b[3] * sw * bubOn * 1.1;
        dm.position.set(b[0], -0.8 * Math.exp(-(b[0] * b[0] + b[1] * b[1]) / 0.85) - 0.13 + sc * 0.2, b[1]);
        dm.scale.set(Math.max(sc, 1e-4), Math.max(sc * 0.55, 1e-4), Math.max(sc, 1e-4));
        dm.rotation.set(0, 0, 0);
        dm.updateMatrix();
        bub.setMatrixAt(i, dm.matrix);
      }
      bub.instanceMatrix.needsUpdate = true;
    }
    // embers lift off the pit with curl-like sway
    embers.visible = emberOn > 0.01;
    if (embers.visible) {
      for (let i = 0; i < NE; i++) {
        const q = es[i], life = 2.4 + q[0] * 3.2, u = ((t + q[1] * 50) / life) % 1;
        const a = q[2] * 6.28, rr = (0.15 + q[3] * 1.05) + u * 1.1;
        ep[i * 3] = Math.cos(a + u * 2.5) * rr + Math.sin(t * 0.9 + q[0] * 9) * 0.18 * u + u * 0.9;
        ep[i * 3 + 1] = -0.25 + u * (3.5 + q[0] * 8);
        ep[i * 3 + 2] = Math.sin(a + u * 2.5) * rr;
      }
      eg.attributes.position.needsUpdate = true;
      embers.material.opacity = emberOn;
    }
    // rain falls through a box that follows the camera; streak length gives speed
    if (rain.visible) {
      for (let i = 0; i < NR; i++) {
        const q = rs[i];
        const x = cam.position.x + (q[0] - 0.5) * 18, z = cam.position.z - 1 - q[1] * 16;
        const y = 14 - ((t * 19 * (0.8 + q[2] * 0.4) + q[3] * 14) % 14);
        rainP[i * 6] = x; rainP[i * 6 + 1] = y; rainP[i * 6 + 2] = z;
        rainP[i * 6 + 3] = x + 0.015; rainP[i * 6 + 4] = y + 0.42; rainP[i * 6 + 5] = z;
      }
      rg.attributes.position.needsUpdate = true;
      rain.material.opacity = 0.34 * rainOn;
    }
    if (droneOn) {
      drone.position.set(1.5 + Math.sin(t * 0.7) * 0.06, 8.3 + Math.sin(t * 1.1) * 0.05, 2.9);
      drone.rotation.set(0.05, 0.25, Math.sin(t * 0.8) * 0.02);
      drone.scale.setScalar(1.0);
      rotors.forEach((rt, i) => { rt.rotation.y = t * 60 * (i % 2 ? 1 : -1); });
    }
    flames.forEach((f) => {
      const a = FIRES[f.userData.i].w;
      f.visible = a > 0.02;
      if (f.visible) { f.userData.u.uA.value = a; f.quaternion.copy(cam.quaternion); }
    });

    VU.uRot.value.setFromMatrix4(rot3.extractRotation(cam.matrixWorld));
    const volOn = VU.uPlume.value > 0 || VU.uHazeD.value > 0 || VU.uSteam.value > 0 || plumeOn;
    over.visible = volOn;
    if (volOn) { r.setRenderTarget(volRT); r.setClearColor(0, 0); r.clear(); r.render(volScene, volCam); r.setRenderTarget(null); }
    bloom.strength = ch === 8 ? 0.26 : 0.36;
    bloom.threshold = 1.05;
    comp.render();
  };
}
