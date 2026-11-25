// EP05 THE RING. One long dive from a ship to the seabed, then forward through a TBM, its erector and a gasket, a sunk tube, and a finished tunnel.
// Lining and gasket details follow FHWA's Technical Manual for tunnels; layout of the service tunnel follows the Channel Tunnel.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, track, volumeNoise, noiseGLSL, skyEnv, canvasTex, box, cyl, std } from "./lib3d.js";

const dm = new THREE.Object3D();
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const YEL = 0xf2b90f, AMB = new THREE.Color(3.2, 1.9, 0.55), SEA = 0x0b3d46;

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true;
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.05, 9000);
  const rnd = mulberry(7500);
  const noise = volumeNoise(64, 75);
  const SUN = v3(-0.45, 0.5, 0.74).normalize();
  const env = skyEnv(r, 0x4f7cb0, 0xcfd9e0, 0x10242a, SUN, 0xfff0d8, 5);
  const envI = skyEnv(r, 0x20242a, 0x3a3a38, 0x151516, v3(0, 1, 0), 0xffc070, 1.2);
  const s = K;
  const concTex = (a, b, seed, rep) => canvasTex(1024, 1024, (c, w) => {
    const R = mulberry(seed); c.fillStyle = a; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { c.fillStyle = R() > 0.5 ? b : "#000"; c.globalAlpha = 0.012 + R() * 0.05; const q = 2 + R() * 22; c.fillRect(R() * w, R() * w, q, q * R()); }
    c.globalAlpha = 1;
  }, rep || [1, 1]);

  // ======== world A: sea, ship and the section below it; depth in metres, 1 unit = 1 m ========
  const A = new THREE.Scene();
  A.environment = env; A.environmentIntensity = 0.6;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uNoise: { value: noise }, uS: { value: SUN }, uT: { value: 0 } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;varying vec3 v;uniform sampler3D uNoise;uniform vec3 uS;uniform float uT;void main(){vec3 n=normalize(v);float y=max(n.y,0.);vec3 c=mix(vec3(.74,.8,.86),vec3(.08,.27,.58),pow(y,.48));float d=max(dot(n,uS),0.);c+=vec3(1.,.92,.75)*(pow(d,1200.)*24.+pow(d,16.)*.2);
      if(n.y>.01){vec2 q=n.xz/(n.y+.1);float a=texture(uNoise,vec3(q*.09+uT*.0006,.2)).r*.65+texture(uNoise,vec3(q*.31,.4)).b*.35;c=mix(c,vec3(.96,.96,.97),smoothstep(.54,.76,a)*smoothstep(.0,.18,n.y)*.9);}gl_FragColor=vec4(c,1.);}`,
  }));
  A.add(sky);
  const WU = { uNoise: { value: noise }, uCam: { value: new THREE.Vector3() }, uSun: { value: SUN }, uTime: { value: 0 } };
  const seaG = new THREE.PlaneGeometry(9000, 9000, 1, 1); seaG.rotateX(-Math.PI / 2);
  const seaM = new THREE.Mesh(seaG, new THREE.ShaderMaterial({
    uniforms: WU, side: THREE.DoubleSide, fog: false,
    vertexShader: "varying vec3 vW;void main(){vW=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `precision highp float;varying vec3 vW;uniform vec3 uCam,uSun;uniform float uTime;${noiseGLSL}
      float hN(vec2 p,float t){return nA(vec3(p*.009,t*.012))*2.+nC(vec3(p*.04+t*.006,t*.02))*.7+nB(vec3(p*.19-t*.018,t*.05))*.16+nB(vec3(p*.7+t*.03,t*.09))*.05;}
      void main(){vec2 p=vW.xz;float d=length(uCam-vW);float sc=max(1.,d*.012);float e=.4*sc;float a=hN(p/sc,uTime),bx=hN((p+vec2(e,0.))/sc,uTime),bz=hN((p+vec2(0.,e))/sc,uTime);
      vec3 n=normalize(vec3(-(bx-a)/e*.5*sc,1.,-(bz-a)/e*.5*sc));vec3 v=normalize(uCam-vW);
      if(uCam.y<0.){float q=hN(p*.5,uTime);float dd=exp(uCam.y*.035);gl_FragColor=vec4(mix(vec3(.06,.3,.34),vec3(.32,.62,.62),smoothstep(1.1,1.75,q))*dd+vec3(.008,.05,.06),1.);return;}
      float f=.02+.98*pow(1.-max(dot(n,v),0.),5.);vec3 r=reflect(-v,n);r.y=abs(r.y);float g=max(dot(r,uSun),0.);
      vec3 c=mix(vec3(.006,.06,.1),mix(vec3(.72,.78,.84),vec3(.1,.27,.56),pow(r.y,.5)),f)+vec3(1.,.93,.82)*(pow(g,620.)*26.+pow(g,40.)*.1);
      c=mix(c,vec3(.72,.78,.84),1.-exp(-d*.0003));gl_FragColor=vec4(c,1.);}`,
  }));
  seaM.frustumCulled = false; A.add(seaM);
  const ship = new THREE.Group(); A.add(ship);
  const hullM = new THREE.MeshStandardMaterial({ color: 0x8a2f24, roughness: 0.55, metalness: 0.35 });
  box(70, 9, 15, hullM, 0, 2, 0, ship);
  box(70, 3, 15.4, new THREE.MeshStandardMaterial({ color: 0x1d2a33, roughness: 0.5 }), 0, 5.5, 0, ship);
  box(14, 12, 12, new THREE.MeshStandardMaterial({ color: 0xeeeee8, roughness: 0.5 }), 22, 13, 0, ship);
  box(9, 5, 9, new THREE.MeshStandardMaterial({ color: 0xddddd8, roughness: 0.5 }), 22, 21, 0, ship);
  const derrick = new THREE.MeshStandardMaterial({ color: YEL, roughness: 0.5, metalness: 0.3 });
  [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(([x, z]) => {
    const m = cyl(0.45, 0.8, 30, 8, derrick, -8 + x * 0.65, 22, z * 0.65, ship);
    m.rotation.z = x * 0.03; m.rotation.x = z * -0.03;
  });
  box(5, 0.8, 5, derrick, -8, 37, 0, ship);
  ship.position.set(0, 0, 0);
  ship.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const ssun = new THREE.DirectionalLight(0xfff0dc, 3.2); ssun.position.copy(SUN).multiplyScalar(200); A.add(ssun);
  // Seabed section: strata as a shader-lit box with a cut face at z = 0.
  const SECT = {
    uNoise: { value: noise }, uMarl: { value: 0 }, uBore: { value: 0 }, uFade: { value: 1 },
  };
  const secM = new THREE.ShaderMaterial({
    uniforms: SECT,
    vertexShader: "varying vec3 vP;void main(){vP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vP,1.);}",
    fragmentShader: `precision highp float;varying vec3 vP;uniform float uMarl,uBore;${noiseGLSL}
      void main(){vec2 p=vP.xy;float wob=(fbm3(vec3(p.x*.0035,p.y*.012,.33))-.5)*30.;float y=p.y+wob*.6;
      float l=fbm3(vec3(p*.022,.5))*.45+nB(vec3(p*.2,.2))*.3+nC(vec3(p*.9,.6))*.25;
      float g=nB(vec3(p*2.6,.8));
      vec3 c;
      if(y>-59.)      c=mix(vec3(.13,.1,.065),vec3(.3,.235,.15),l);
      else if(y>-68.) c=mix(vec3(.26,.25,.21),vec3(.46,.44,.38),l);
      else if(y>-92.) { c=mix(vec3(.29,.27,.2),vec3(.5,.47,.36),l); c=mix(c,c*vec3(1.25,1.14,.82)+vec3(.05,.035,0.),uMarl); }
      else            c=mix(vec3(.055,.05,.05),vec3(.14,.125,.115),l);
      float bed=abs(sin(y*.9+wob*.7+p.x*.003));c*=.8+.2*smoothstep(0.,.35,bed);
      c*=(.82+.36*g)*.55;
      float edge=min(min(abs(y+59.),abs(y+68.)),abs(y+92.));c*=.72+.28*smoothstep(0.,.7,edge);
      gl_FragColor=vec4(c,1.);}`,
  });
  const section = new THREE.Mesh(new THREE.BoxGeometry(2000, 500, 400), secM);
  section.position.set(0, -53.5 - 250, -200); A.add(section);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 3000, 200, 200), new THREE.MeshStandardMaterial({ color: 0x655a44, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -52, -1500);
  const fp = floor.geometry.attributes.position; for (let i = 0; i < fp.count; i++) fp.setZ(i, Math.sin(fp.getX(i) * 0.03) * 0.25 + Math.sin(fp.getY(i) * 0.04 + fp.getX(i) * 0.012) * 0.3);
  floor.geometry.computeVertexNormals(); A.add(floor);
  const hemi = new THREE.HemisphereLight(0x8fd8e0, 0x24303a, 1.5); A.add(hemi);
  // The tunnel in the section: dark bore with a lit ring, centre at -75 m.
  const TUNY = -75, TUNR = 3.8;
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(TUNR + 0.3, 0.32, 16, 64), new THREE.MeshStandardMaterial({ color: 0xc0bcb2, roughness: 0.75 }));
  ringA.position.set(0, TUNY, 0.3); A.add(ringA);
  const bore = new THREE.Mesh(new THREE.CircleGeometry(TUNR, 64), new THREE.MeshBasicMaterial({ map: canvasTex(512, 512, (c, w) => {
    c.fillStyle = "#050505"; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 30; i++) { const u = i / 30; const R = 256 * Math.pow(1 - u, 1.8); const k = Math.floor(25 + u * u * 190); c.strokeStyle = `rgb(${k + 30},${k + 14},${Math.floor(k * 0.7)})`; c.lineWidth = 3 + (1 - u) * 5; c.beginPath(); c.arc(w / 2, w / 2 + 16 * u, R, 0, 7); c.stroke(); }
    const g = c.createRadialGradient(w / 2, w / 2 + 16, 0, w / 2, w / 2 + 16, 60); g.addColorStop(0, "#ffd9a0"); g.addColorStop(1, "rgba(255,190,110,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w);
    c.fillStyle = "#0a0908"; c.fillRect(0, w * 0.74, w, w * 0.26);
  }) }));
  bore.position.set(0, TUNY, 0.15); A.add(bore);
  // Pressure arrows close around the ring; they lengthen with depth.
  const NP = 16;
  const pArrows = new THREE.InstancedMesh(new THREE.ConeGeometry(0.2, 1.3, 12).translate(0, -0.65, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1.5, 1.8) }), NP);
  pArrows.frustumCulled = false; A.add(pArrows);
  // Depth column and survey ping
  const pingM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.8, 1.8), transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
  const ping = new THREE.Mesh(new THREE.ConeGeometry(30, 52, 40, 1, true), pingM); ping.position.set(-18, -26, 2); A.add(ping);
  const coreM = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1, 12), new THREE.MeshStandardMaterial({ color: 0x2f3438, roughness: 0.4, metalness: 0.8 }));
  coreM.position.set(-20, -52, 0.5); A.add(coreM);
  const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 5, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 1.3, 1.3), transparent: true, opacity: 0.6 }), 600);
  motes.frustumCulled = false; A.add(motes);
  for (let i = 0; i < 600; i++) { dm.position.set((rnd() - 0.5) * 120, -rnd() * 50, rnd() * 34 - 2); dm.scale.setScalar(0.5 + rnd()); dm.updateMatrix(); motes.setMatrixAt(i, dm.matrix); }
  const lamp2 = new THREE.DirectionalLight(0xbdeaf0, 1.5); lamp2.position.set(-20, 60, 50); A.add(lamp2);

  const strataTag = (txt, y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, map: canvasTex(620, 100, (c, w, h) => { c.font = "700 58px Inter,Arial"; c.fillStyle = "#fff"; c.shadowColor = "#000"; c.shadowBlur = 10; c.textBaseline = "middle"; c.fillText(txt, 8, h / 2 + 2); }) }));
    m.position.set(-10.5, y, 0.6); A.add(m); return m;
  };
  const tags = [strataTag("PASIR & LANAU", -56), strataTag("KAPUR", -63.5), strataTag("KAPUR MARL", -77), strataTag("LEMPUNG", -97)];
  // Immersed-tube chapter stays in world A: trench, tube elements, a barge, joint seal.
  const IM = new THREE.Group(); IM.visible = false; A.add(IM);
  const tubeM = new THREE.MeshStandardMaterial({ map: concTex("#a8a397", "#ccc7ba", 31), roughness: 0.82, metalness: 0.02 });
  const elemL = 40, elemW = 18, elemH = 8;
  const elements = [0, 1, 2, 3, 4].map((i) => {
    const g = new THREE.Group();
    const m = box(elemL, elemH, elemW, tubeM, 0, 0, 0, g);
    m.castShadow = true;
    [-1, 1].forEach((sd) => box(0.5, elemH * 0.92, elemW * 0.92, new THREE.MeshStandardMaterial({ color: 0x36383c, roughness: 0.5, metalness: 0.5 }), (sd * elemL) / 2, 0, 0, g));
    for (const sz of [-4.4, 4.4]) [-1, 1].forEach((sd) => box(0.1, elemH * 0.62, 6.2, new THREE.MeshBasicMaterial({ color: 0x050608 }), (sd * elemL) / 2 + sd * 0.27, 0, sz, g));
    g.position.set(-116 + i * (elemL + 0.4), -48, 0);
    IM.add(g);
    return g;
  });
  // Front face of the elements is opened in the chapter so two bores read as a cross-section.
  const barge = new THREE.Group(); IM.add(barge);
  box(58, 3, 30, new THREE.MeshStandardMaterial({ color: 0x4c5158, roughness: 0.6, metalness: 0.5 }), 0, 1.4, 0, barge);
  [-22, 22].forEach((x) => cyl(0.9, 1, 22, 10, derrick, x, 12, 0, barge));
  const slings = [-16, 16].map((x) => { const m = cyl(0.14, 0.14, 1, 6, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.3 }), x, 0, 0, IM); return m; });
  // Gina seal between element 2 and the one coming down, lit on contact.
  const gina = new THREE.Mesh(new THREE.BoxGeometry(0.9, elemH * 0.96, elemW * 0.96), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.7 }));
  IM.add(gina);
  const pumpW = box(0.4, 7.2, 17, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.8, 1), transparent: true, opacity: 0.8 }), 0, 0, 0, IM);
  // Trench walls
  const trench = new THREE.Group(); IM.add(trench);
  box(400, 1.6, 30, new THREE.MeshStandardMaterial({ color: 0x4a4436, roughness: 1 }), 0, -52.9, 0, trench);

  // ======== world B: inside the ground, metres; bore axis along -z ========
  const B = new THREE.Scene();
  B.environment = envI; B.environmentIntensity = 0.5;
  B.background = new THREE.Color(0x0a0908);
  B.fog = new THREE.FogExp2(0x151310, 0.012);
  const rockTex = canvasTex(1024, 1024, (c, w, h) => {
    const R = mulberry(9); c.fillStyle = "#8d8876"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 18000; i++) { c.fillStyle = R() > 0.5 ? "#3f3c33" : "#bcb7a2"; c.globalAlpha = 0.03 + R() * 0.1; const q = 1 + R() * 14; c.fillRect(R() * w, R() * h, q, q * (0.2 + R())); } c.globalAlpha = 1;
  }, [8, 2]);
  const R0 = 3.8, CUT = 0;
  const bore3 = new THREE.Mesh(new THREE.CylinderGeometry(R0 + 0.3, R0 + 0.3, 400, 64, 1, true), new THREE.MeshStandardMaterial({ map: rockTex, roughness: 1, side: THREE.BackSide }));
  bore3.rotation.x = Math.PI / 2; bore3.position.z = -180; B.add(bore3);
  // Segment: one curved concrete piece of a 7-part ring (6 + key).
  const NSEG = 7, LEN = 1.5, THK = 0.32;
  const segMat = new THREE.MeshStandardMaterial({ map: concTex("#b9b5ab", "#d9d5cb", 12), roughness: 0.82 });
  const gasketMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0e, roughness: 0.55 });
  const segGeo = (() => {
    const a0 = (2 * Math.PI) / NSEG * 0.985;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, R0, 0, a0, false);
    shape.absarc(0, 0, R0 - THK, a0, 0, true);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: LEN * 0.985, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 18 });
    g.translate(0, 0, -LEN * 0.985);
    return g;
  })();
  // Rings already built in the tail; index order drives the erector sequence.
  const RINGS = 90;
  const lining = new THREE.InstancedMesh(segGeo, segMat, RINGS * NSEG);
  lining.frustumCulled = false; lining.castShadow = lining.receiveShadow = true; B.add(lining);
  const qR = new THREE.Quaternion(), zAxis = v3(0, 0, 1);
  const setSeg = (mesh, idx, ring, seg, off) => {
    dm.position.set(0, 0, -ring * LEN + (off ? off.z : 0));
    dm.quaternion.setFromAxisAngle(zAxis, (seg / NSEG) * Math.PI * 2 + (ring % 2) * 0.22);
    dm.scale.setScalar(1);
    if (off) { const a = (seg + 0.5) / NSEG * Math.PI * 2 + (ring % 2) * 0.22; dm.position.x = Math.cos(a) * -off.r; dm.position.y = Math.sin(a) * -off.r; }
    dm.updateMatrix(); mesh.setMatrixAt(idx, dm.matrix);
  };
  const hideI = (mesh, i) => { dm.position.set(0, 0, 900); dm.scale.setScalar(0.0001); dm.quaternion.identity(); dm.updateMatrix(); mesh.setMatrixAt(i, dm.matrix); };
  // TBM group faces -z and is positioned each frame.
  const TBM = new THREE.Group(); B.add(TBM);
  const shieldM = new THREE.MeshStandardMaterial({ color: 0x9c7a12, roughness: 0.5, metalness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.42, metalness: 0.85 });
  const steelM = new THREE.MeshStandardMaterial({ color: 0x8b9096, roughness: 0.35, metalness: 0.9 });
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(R0 + 0.22, R0 + 0.22, 10, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x9c7a12, roughness: 0.5, metalness: 0.7, side: THREE.DoubleSide }));
  shield.rotation.x = Math.PI / 2; shield.position.z = -5; shield.castShadow = true; TBM.add(shield);
  const cutter = new THREE.Group(); cutter.position.z = -10.1; TBM.add(cutter);
  const cBack = new THREE.Mesh(new THREE.CylinderGeometry(R0 + 0.15, R0 + 0.15, 0.7, 64), new THREE.MeshStandardMaterial({ color: 0x34363a, roughness: 0.5, metalness: 0.75 })); cBack.rotation.x = Math.PI / 2; cutter.add(cBack);
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group(); g.rotation.z = (i / 6) * Math.PI * 2; cutter.add(g);
    box(0.85, R0, 0.6, shieldM, 0, R0 / 2 + 0.1, -0.5, g);
    for (let k = 0; k < 4; k++) {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.1, 24), steelM);
      disc.rotation.z = Math.PI / 2; disc.position.set(k % 2 ? 0.17 : -0.17, 0.8 + k * 0.8, -0.86); g.add(disc);
    }
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.9, 0.9, 32), dark); hub.rotation.x = Math.PI / 2; hub.position.z = -0.6; cutter.add(hub);
  // Pressure bulkhead with slurry chamber behind the cutter head.
  const bulk = new THREE.Mesh(new THREE.CircleGeometry(R0 + 0.15, 64), new THREE.MeshStandardMaterial({ color: 0x3b3e43, roughness: 0.5, metalness: 0.7, side: THREE.DoubleSide })); bulk.position.z = -8.3; TBM.add(bulk);
  const slurry = new THREE.Mesh(new THREE.CylinderGeometry(R0 + 0.16, R0 + 0.16, 1.5, 48), new THREE.MeshStandardMaterial({ color: 0x4d3a26, roughness: 0.4, transparent: true, opacity: 0 })); slurry.rotation.x = Math.PI / 2; slurry.position.z = -9; TBM.add(slurry);
  // Thrust rams push against the last ring, which is why the machine compresses the gaskets as it advances.
  const rams = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rm = cyl(0.11, 0.11, 2.6, 10, steelM, Math.cos(a) * (R0 - 0.42), Math.sin(a) * (R0 - 0.42), -1.8, TBM);
    rm.rotation.x = Math.PI / 2;
    rams.push(rm);
  }
  // Erector: a rotating arm carrying the next segment.
  const erector = new THREE.Group(); erector.position.z = -2; TBM.add(erector);
  const eHub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 24), dark); eHub.rotation.x = Math.PI / 2; erector.add(eHub);
  const armHolder = new THREE.Group(); erector.add(armHolder);
  const eArm = box(0.3, 3.3, 0.28, new THREE.MeshStandardMaterial({ color: 0xa47f0c, roughness: 0.55, metalness: 0.4 }), 0, 1.65, -0.75, armHolder);
  const carried = new THREE.Mesh(segGeo, segMat); erector.add(carried);
  // Work lights inside the machine
  const wlights = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 1.1), new THREE.MeshBasicMaterial({ color: AMB }));
    const side = i % 2 ? 1 : -1; m.position.set(side * (R0 - 0.55), 1.65, -2 - i * 6); B.add(m); wlights.push(m);
  }
  const lamp = new THREE.PointLight(0xffd9a8, 130, 44, 1.4); B.add(lamp);
  const lamp3 = new THREE.PointLight(0xffb060, 60, 26, 1.4); B.add(lamp3);
  // Face support: amber = slurry pressure pushing out, cyan = ground water pushing in. They balance at the face.
  const face = Array.from({ length: 12 }, (_, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.7, 12), new THREE.MeshBasicMaterial({ color: i % 2 ? new THREE.Color(0.25, 0.85, 1) : new THREE.Color(1, 0.6, 0.12) })); TBM.add(m); return m; });
  // Rock chips off the face
  const NCH = 150;
  const chips = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.05), new THREE.MeshStandardMaterial({ color: 0x9d9880, roughness: 1 }), NCH);
  chips.frustumCulled = false; TBM.add(chips);
  const seedC = Array.from({ length: NCH }, () => [rnd(), rnd(), rnd(), rnd() * 6.28]);

  // Close-up gasket rig: two segments with a rubber profile. Gap closes on word, bolt tightens, water pressure stops at the seal.
  const GK = new THREE.Group(); GK.visible = false; B.add(GK);
  const gseg = (x) => { const m = box(5, 3, 0.8, segMat, x, 0, -30); return m; };
  const gA = gseg(-2.7), gB = gseg(2.7); GK.add(gA, gB);
  const gaskets = [-0.2, 0.2].map((x) => { const m = box(0.3, 2.6, 0.26, gasketMat, x, 0, -29.72); GK.add(m); return m; });
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.1, 16), steelM); bolt.rotation.z = Math.PI / 2; bolt.position.set(0, 0.7, -30); GK.add(bolt);
  const nutA = cyl(0.22, 0.22, 0.2, 6, steelM, -1.05, 0.7, -30); nutA.rotation.z = Math.PI / 2; GK.add(nutA);
  const nutB = cyl(0.22, 0.22, 0.2, 6, steelM, 1.05, 0.7, -30); nutB.rotation.z = Math.PI / 2; GK.add(nutB);
  const dripM = new THREE.MeshPhysicalMaterial({ color: 0x8fdfe8, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.85 });
  const drips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 6), dripM, 60);
  drips.frustumCulled = false; GK.add(drips);
  const seedD = Array.from({ length: 60 }, () => [rnd(), rnd(), rnd()]);
  const seep = new THREE.DirectionalLight(0xfff2d8, 1.8); seep.position.set(-2, 3, -20); seep.target.position.set(0, 0, -30); GK.add(seep, seep.target);

  // ======== world C: finished tunnel ========
  const C = new THREE.Scene();
  C.environment = envI; C.environmentIntensity = 0.45;
  C.background = new THREE.Color(0x050505);
  C.fog = new THREE.FogExp2(0x0c0a08, 0.012);
  const linC = new THREE.InstancedMesh(segGeo, new THREE.MeshStandardMaterial({ map: concTex("#a9a59b", "#c8c3b9", 12), roughness: 0.9 }), 7 * 180);
  linC.frustumCulled = false; C.add(linC);
  for (let i = 0; i < 180; i++) for (let j = 0; j < NSEG; j++) setSeg(linC, i * NSEG + j, i - 20, j);
  // trackbed, rails, walkway
  const bedC = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.9, 600), new THREE.MeshStandardMaterial({ color: 0x3a3936, roughness: 0.95 })); bedC.position.set(0, -2.45, -200); C.add(bedC);
  [-0.72, 0.72].forEach((x) => { const rail = box(0.09, 0.14, 600, new THREE.MeshStandardMaterial({ color: 0xbfc3c8, roughness: 0.22, metalness: 1 }), x, -1.93, -200, C); rail.castShadow = false; });
  box(1, 0.1, 600, new THREE.MeshStandardMaterial({ color: 0x6f7073, roughness: 0.8 }), 2.5, -1.2, -200, C);
  const lampCount = 34;
  for (let i = 0; i < lampCount; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 1.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.4, 1.3) })); m.position.set(i % 2 ? 2.6 : -2.6, 1.9, 10 - i * 16); C.add(m); }
  const pipes = [[-2.85, 0.35], [-2.85, 0.1], [2.95, -0.25]].map(([x, y]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 600, 10), new THREE.MeshStandardMaterial({ color: 0x4f6e8e, roughness: 0.4, metalness: 0.6 })); m.rotation.x = Math.PI / 2; m.position.set(x, y, -200); C.add(m); return m; });
  // Sump water and pump in the drain
  const sump = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 600), new THREE.MeshPhysicalMaterial({ color: 0x2b5960, roughness: 0.08, metalness: 0.1 })); sump.rotation.x = -Math.PI / 2; sump.position.set(2.1, -1.89, -200); C.add(sump);
  // Moving air: fine dust lit by the lamps shows the ventilation current.
  const dustN = 300;
  const dust = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 5, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.3, 0.9), transparent: true, opacity: 0.55 }), dustN);
  dust.frustumCulled = false; C.add(dust);
  const seedAir = Array.from({ length: dustN }, () => [rnd(), rnd(), rnd()]);
  // Train
  const train = new THREE.Group(); C.add(train);
  const carM = new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.28, metalness: 0.6 });
  const carStripe = new THREE.MeshStandardMaterial({ color: 0x0b3d2e, roughness: 0.4, metalness: 0.4 });
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.62, 0.52, 0.34) });
  for (let c = 0; c < 8; c++) {
    const z = c * 21;
    box(2.8, 3.2, 20, carM, 0, -0.2, z, train);
    box(2.84, 0.42, 20, carStripe, 0, -1.1, z, train);
    [-1, 1].forEach((sd) => { for (let i = 0; i < 8; i++) box(0.02, 0.62, 1.5, winM, sd * 1.415, 0.25, z - 8 + i * 2.25, train); });
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.62, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), carM); nose.scale.set(0.87, 1, 2); nose.rotation.x = -Math.PI / 2; nose.position.set(0, -0.2, -10); train.add(nose);
  [-0.8, 0.8].forEach((x) => { const hl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3, 2.3) })); hl.position.set(x, -0.45, -12.5); train.add(hl); });
  const trainL = new THREE.SpotLight(0xfff0d8, 400, 90, 0.55, 0.6, 1.3); trainL.position.set(0, 0, -13); trainL.target.position.set(0, -1, -60); train.add(trainL, trainL.target);
  [[-1.8, 1.9, 22], [1.8, 1.9, -26], [-1.8, 1.9, -74], [1.8, 1.9, -122]].forEach(([x, y, z]) => { const p = new THREE.PointLight(0xffd8a0, 70, 26, 1.5); p.position.set(x, y, z); C.add(p); });
  // Three-bore section appears as a model on the last chapter: rail, service, rail.
  const X3 = new THREE.Group(); C.add(X3); X3.visible = false;
  const earth3 = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshBasicMaterial({ color: 0x8a8370, map: concTex("#7d776a", "#a29a88", 44, [5, 5]), fog: false })); earth3.position.z = -0.1; X3.add(earth3);
  const bores3 = [[-8, 3.8, 0x1a1c1f], [0, 2.4, 0x2a1e12], [8, 3.8, 0x1a1c1f]].map(([x, rad, col]) => {
    const g = new THREE.Group(); g.position.x = x; X3.add(g);
    const d = new THREE.Mesh(new THREE.CircleGeometry(rad, 48), new THREE.MeshBasicMaterial({ color: col })); d.position.z = 0.02; g.add(d);
    const rg = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.22, 12, 56), new THREE.MeshBasicMaterial({ color: 0xd8d4ca, fog: false })); rg.position.z = 0.05; g.add(rg);
    return g;
  });
  [["REL", -8], ["LAYANAN", 0], ["REL", 8]].forEach(([txt, x]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.5), new THREE.MeshBasicMaterial({ transparent: true, fog: false, map: canvasTex(420, 90, (c, w, h) => { c.font = "800 62px Inter,Arial"; c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, w / 2, h / 2 + 3); }) }));
    m.position.set(x, x === 0 ? -3.8 : -5.2, 0.08); X3.add(m);
  });
  const cross = new THREE.Mesh(new THREE.BoxGeometry(11, 0.9, 0.03), new THREE.MeshBasicMaterial({ color: 0x252018 })); cross.position.z = 0.015; X3.add(cross);
  const aPath = new THREE.InstancedMesh(new THREE.ConeGeometry(0.42, 1.0, 12).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 1.5, 0.7), fog: false }), 8);
  aPath.frustumCulled = false; X3.add(aPath);

  const composer = (scn, st, thr) => {
    const c = new EffectComposer(r, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 }));
    c.setSize(1080, 1920);
    c.addPass(new RenderPass(scn, cam));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), st, 0.5, thr));
    c.addPass(new OutputPass());
    return c;
  };
  const cA = composer(A, 0.2, 1.2), cB = composer(B, 0.26, 1.1), cC = composer(C, 0.32, 1.05);

  const E = {
    tekanan: AT["s2:tekanan"], atm: AT["s2:atmosfer"], d75: AT["s2:75"], tujuh: AT["s2:tujuh"], selidik: AT["s3:menyelidiki"], lapisan: AT["s3:lapisan"], marl: AT["s3:kapur"], tbm: AT["s4:TBM"], kepala: AT["s4:pemotongnya"], tanahl: AT["s4:lunak"], tekan4: AT["s4:tekanan"],
    segmen: AT["s5:segmen"], cincin: AT["s5:cincin"], gasket: AT["s6:gasket"], baut: AT["s6:Baut"], rapat: AT["s6:rapat"], tabung: AT["s7:tabung"], darat: AT["s7:darat"], apung: AT["s7:diapungkan"], benam: AT["s7:ditenggelamkan"], rapatkan: AT["s7:dirapatkan"], pompa: AT["s7:dipompa"],
    pompa8: AT["s8:pompa"], vent: AT["s8:Ventilasi"], layanan: AT["s8:layanan"], dikendal: AT["s8:dikendalikan"],
  };
  // One dive: aerial, surface break, sink past the ship's keel to the cut face.
  const camDive = track([
    [0, 90, 28, 185, 0, 11, 0],
    [s.s1e - 2.2, 62, 16, 142, 0, 6, 0],
    [s.s1e, 28, -3, 88, 0, -16, 0],
    [s.s2 + 1.2, 12, -28, 46, 0, -48, 0],
    [E.d75 - 0.4, 5, -66, 30, 0, -72, 0],
    [s.s2e, 3, -74, 27, 0, -75, 0],
    [s.s3 + 0.3, -8, -56, 72, -8, -61, 0],
    [s.s3e, -10, -73, 62, -10, -75, 0],
  ]);
  const camTBM = track([
    [s.s4 - 0.01, 2.2, 1.6, -118, 0, 0, -89],
    [E.kepala, 1, 0.5, -112, 0, 0, -89],
    [E.tanahl, -1.2, -0.4, -106, 0, 0, -89],
    [s.s4e, -1.6, -0.6, -104, 0, 0, -89],
  ]);
  const camSeg = track([
    [s.s5 - 0.01, 1.4, 0.6, -64, 0, 0.3, -96],
    [s.s5e, -1.2, -0.4, -69, 0, 0.5, -96],
  ]);
  const camGK = track([
    [s.s6, -1.6, 1.3, -24, 0, 0.2, -30],
    [E.gasket, -0.6, 0.6, -25.6, 0, 0.1, -30],
    [E.rapat, 0.3, 0.4, -26, 0, 0.2, -30],
    [s.s6e, 0.8, 0.5, -26.5, 0, 0.2, -30],
  ]);
  const camIM = track([
    [s.s7, -18, 13, 118, 0, 2, 0],
    [E.apung, -6, 7, 92, 0, 0, 0],
    [E.benam - 0.1, -3, -5, 90, 0, -12, 0],
    [E.benam + 1.6, -5, -22, 78, 0, -24, 0],
    [E.rapatkan - 0.2, -26, -40, 42, -12, -44, 0],
    [E.rapatkan + 0.6, -27, -44, 30, -14, -47, 0],
    [s.s7e, -26, -45, 26, -14.5, -48, 0],
  ]);
  const camC = track([
    [s.s8, 2.35, -0.15, 22, 0.5, -0.5, -60],
    [E.vent, 2.3, -0.2, 14, 0.5, -0.4, -60],
    [E.layanan - 0.1, 2.25, -0.2, 8, 0.4, -0.3, -60],
  ]);
  const rot = (c) => { cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]); };
  const col = new THREE.Color();
  let builtRings = -1;

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    WU.uTime.value = t; sky.material.uniforms.uT.value = t;
    if (t < s.s4 || (t >= s.s7 && t < s.s8)) {
      const imm = t >= s.s7;
      rot(imm ? camIM(t) : camDive(t));
      cam.updateMatrixWorld();
      WU.uCam.value.copy(cam.position);
      const under = cam.position.y < 0;
      sky.visible = !under;
      if (under) { const dd = clamp01(-cam.position.y / 60); const kk = imm ? 1 : 1 - dd * 0.7; A.background = new THREE.Color(0.035 * kk, 0.18 * kk, 0.22 * kk); A.fog = new THREE.FogExp2(0x0d4750, imm ? 0.0036 : 0.006 + dd * 0.004); } else { A.background = null; A.fog = null; }
      ssun.intensity = under ? 1.1 : 3.2;
      ship.visible = !imm;
      section.visible = !imm; floor.visible = true;
      IM.visible = imm;
      floor.position.z = imm ? 0 : -1500;
      floor.position.y = imm ? -52.5 : -52;
      ringA.visible = bore.visible = !imm;
      // pressure ring: arrows press inward, grow with the on-screen depth
      const pOn = !imm && t >= E.tekanan - 0.2 && t < s.s3 ? ramp(t, E.atm, E.d75 + 0.4) : 0;
      for (let i = 0; i < NP; i++) {
        const a = (i / NP) * Math.PI * 2;
        const R = TUNR + 2.1 + 0.25 * Math.sin(t * 3 + i);
        dm.position.set(Math.cos(a) * R, TUNY + Math.sin(a) * R, 1);
        dm.quaternion.setFromUnitVectors(v3(0, 1, 0), v3(Math.cos(a), Math.sin(a), 0));
        dm.scale.setScalar(pOn * (0.8 + 0.5 * pOn) + 0.0001);
        dm.updateMatrix(); pArrows.setMatrixAt(i, dm.matrix);
      }
      pArrows.instanceMatrix.needsUpdate = true;
      motes.visible = under;
      // survey: acoustic ping and a core barrel into the seabed
      const surv = !imm && t >= s.s3 ? 1 : 0;
      tags.forEach((m, i) => { m.visible = surv > 0; m.material.opacity = ramp(t, s.s3 + 2 + i * 0.25, s.s3 + 2.7 + i * 0.25); });
      pingM.opacity = surv * (0.12 + 0.1 * Math.sin(t * 6)) * (1 - ramp(t, E.lapisan, E.marl));
      const depthP = ramp(t, E.lapisan - 0.2, E.marl + 0.2);
      coreM.visible = surv > 0 && !imm;
      coreM.scale.y = 1 + depthP * 40;
      coreM.position.y = -52 - coreM.scale.y / 2;
      SECT.uMarl.value = !imm ? ramp(t, E.marl, E.marl + 0.5) : 0;
      if (imm) {
        // The element floats until the word, then sinks along slings into the trench and pulls against its neighbour.
        const fl = ramp(t, E.apung - 0.3, E.apung + 0.5);
        const sink = ramp(t, E.benam, E.rapatkan - 0.3);
        const last = elements[4];
        const lx = -90 + 4 * (elemL + 0.4);
        const close = ramp(t, E.rapatkan - 0.3, E.rapatkan + 0.4);
        elements.forEach((g, i) => { g.visible = i < 3 || i === 4; });
        last.position.set(lx - elemL - 1.6 - 3.2 * (1 - close) + 4, THREE.MathUtils.lerp(1.2, -48, sink), 0);
        last.position.x = elements[2].position.x + elemL + 0.8 + (1 - close) * 3.5;
        last.rotation.z = Math.sin(t * 0.9) * 0.007 * (1 - sink);
        barge.position.set(last.position.x, 0.3 + Math.sin(t * 0.9) * 0.15, 0);
        slings.forEach((m, i) => {
          const len = Math.max(1, Math.abs(last.position.y));
          m.position.set(last.position.x + (i ? 16 : -16), last.position.y / 2 + 2, 0); m.scale.y = len;
        });
        gina.position.set(elements[2].position.x + elemL / 2 + 0.4 + (1 - close) * 0.3, -48, 0);
        gina.scale.x = 1 - close * 0.42;
        const pu = ramp(t, E.pompa - 0.2, E.pompa + 1.1);
        pumpW.position.set(gina.position.x, -48 - pu * 3.5, 0); pumpW.scale.y = Math.max(0.001, 1 - pu);
        pumpW.material.opacity = 0.9 * (1 - pu) * close;
        pumpW.visible = close > 0.02;
        barge.visible = sink < 0.98;
      }
      cA.render();
      return;
    }
    if (t < s.s8) {
      // ---- inside the machine ----
      const gkMode = t >= s.s6;
      GK.visible = gkMode;
      rot(gkMode ? camGK(t) : t < s.s5 ? camTBM(t) : camSeg(t));
      // Machine advances one ring per erector cycle.
      const dur = s.s5e - s.s5;
      const cycles = 1;
      const ph = clamp01((t - s.s5) / dur) * cycles;
      const whole = Math.min(cycles, Math.floor(ph));
      const frac = ph - whole;
      const adv = (t < s.s5 ? 0 : ramp(frac, 0, 0.1) * 0) * LEN;
      const head = 53 + adv / LEN;
      TBM.position.z = -head * LEN;
      TBM.visible = !gkMode;
      const placeF = clamp01((t - s.s5 - 0.2) / Math.max(0.5, dur - 0.6)) * NSEG;
      const placed = t < s.s5 ? -1 : Math.min(NSEG, Math.floor(placeF));
      const lastRing = 56;
      // Rings up to the tail are complete; the current ring grows piece by piece.
      for (let ring = 0; ring < RINGS; ring++) {
        for (let seg = 0; seg < NSEG; seg++) {
          const id = ring * NSEG + seg;
          const inMachine = ring > lastRing + 0;
          if (gkMode || inMachine) { hideI(lining, id); continue; }
          if (ring === lastRing && t >= s.s5 && seg >= placed) { hideI(lining, id); continue; }
          setSeg(lining, id, ring, seg);
        }
      }
      lining.instanceMatrix.needsUpdate = true;
      cutter.rotation.z = -t * 0.75;
      slurry.material.opacity = ramp(t, E.tekan4 - 0.3, E.tekan4 + 0.4) * 0.45;
      const cur = Math.min(NSEG - 1, Math.max(0, placed));
      erector.rotation.z = (cur / NSEG) * Math.PI * 2 + (lastRing % 2) * 0.22;
      const seat = ramp(placeF % 1, 0.15, 0.92);
      const midA = ((2 * Math.PI) / NSEG) * 0.4925;
      carried.rotation.z = 0;
      carried.position.set(-Math.cos(midA) * 1.0 * (1 - seat), -Math.sin(midA) * 1.0 * (1 - seat), 0);
      carried.visible = t >= s.s5 && placed < NSEG;
      armHolder.rotation.z = midA - Math.PI / 2;
      armHolder.scale.y = 0.72 + seat * 0.28;
      erector.position.z = lastRing * -LEN - TBM.position.z;
      rams.forEach((m, i) => { m.position.z = -1.8 + ramp(frac, 0, 0.12) * 0.25; });
      const front = t < s.s5;
      lamp.position.set(front ? 2 : 0, front ? 1.5 : 1, front ? -104 : -74);
      lamp3.position.set(front ? -3 : 0, front ? -2 : -1.2, front ? -98 : -66);
      erector.visible = !front;
      face.forEach((m, i) => { const on = front ? ramp(t, E.tekan4 - 0.2, E.tekan4 + 0.4) : 0; const u = (t * 0.7 + i / 12) % 1; const a = (i / 12) * Math.PI * 2; const out = i % 2 === 0; m.visible = on > 0.01; m.position.set(Math.cos(a) * 2.4, Math.sin(a) * 2.4, -12.2 - (out ? u : 1 - u) * 1.8); m.rotation.x = out ? -Math.PI / 2 : Math.PI / 2; m.scale.setScalar(on); });
      for (let i = 0; i < NCH; i++) {
        const q = seedC[i];
        const u = (q[0] + t * (0.6 + q[1] * 0.5)) % 1;
        const a = q[3] + t * 0.5;
        const rr = 0.4 + q[2] * (R0 - 0.7);
        dm.position.set(Math.cos(a) * rr, Math.sin(a) * rr - u * u * 1.1, -10.6 - (1 - u) * 0.6);
        dm.rotation.set(q[3] + t * 2, q[1] * 6, q[2] * 6);
        dm.scale.setScalar(t > E.kepala && t < s.s5 ? 0.35 + q[1] * 0.6 : 0.0001);
        dm.updateMatrix(); chips.setMatrixAt(i, dm.matrix);
      }
      chips.instanceMatrix.needsUpdate = true;
      if (gkMode) {
        // ---- gasket ----
        const seal = ramp(t, E.baut, E.rapat + 0.15);
        const gap = (1 - seal) * 0.7;
        gA.position.x = -2.7 - gap / 2; gB.position.x = 2.7 + gap / 2;
        gaskets[0].position.x = -0.15 - gap / 2 - seal * 0.0; gaskets[1].position.x = 0.15 + gap / 2;
        gaskets.forEach((m) => { m.scale.x = 1 - seal * 0.42; m.scale.z = 1 + seal * 0.12; });
        bolt.scale.y = 1 - 0.08 * seal;
        nutA.position.x = -1.2 - gap / 2 + seal * 0.15; nutB.position.x = 1.2 + gap / 2 - seal * 0.15;
        nutA.rotation.y = seal * 12; nutB.rotation.y = -seal * 12;
        for (let i = 0; i < 60; i++) {
          const q = seedD[i];
          const u = (q[0] + t * 0.42) % 1;
          // Water is pressing from behind. Before the seal it gets through the joint; after, it cannot.
          const open = 1 - seal;
          dm.position.set((q[1] - 0.5) * gap * 0.75, 1.1 - u * 2.9 * open - (1 - open) * 9, -29.5 + 0.2 * (q[2] - 0.5));
          dm.scale.set(open < 0.02 || i > 26 ? 0.0001 : 0.5 + q[2] * 0.5, open < 0.02 || i > 26 ? 0.0001 : 1.4 + q[2], 0.6); dm.updateMatrix(); drips.setMatrixAt(i, dm.matrix);
        }
        drips.instanceMatrix.needsUpdate = true;
        lamp.position.set(-3, 3, -22); lamp.intensity = 34; lamp3.intensity = 0;
        B.background.set(0x0a0908);
      } else { lamp.intensity = t < s.s5 ? 42 : 26; lamp3.intensity = t < s.s5 ? 22 : 14; }
      cB.render();
      return;
    }
    // ---- finished tunnel ----
    const xsec = t >= E.layanan - 0.05;
    X3.visible = xsec;
    if (xsec) {
      X3.position.set(0, 300, -30);
      rot([0, 300, -30 + 72 - ramp(t, E.layanan, s.end) * 5, 0, 298, -30]);
      const a = ramp(t, E.layanan + 0.3, E.layanan + 0.9);
      for (let i = 0; i < 8; i++) {
        const side = i < 4 ? -1 : 1, u = (((t * 0.7 + (i % 4) / 4) % 1));
        dm.position.set(side * (5.6 - u * 3.6), 0.1 + 0.05, 0.2);
        dm.quaternion.setFromUnitVectors(v3(0, 1, 0), v3(-side, 0, 0));
        dm.scale.setScalar(a); dm.updateMatrix(); aPath.setMatrixAt(i, dm.matrix);
      }
      aPath.instanceMatrix.needsUpdate = true;
      C.fog = null;
      train.visible = false;
    } else {
      rot(camC(t));
      const u = (t - s.s8) / Math.max(1, E.layanan - s.s8);
      train.visible = t > E.vent - 3;
      train.position.set(0, -0.4, 70 - (t - (E.vent - 3)) * 42);
      C.fog = C.fog || new THREE.FogExp2(0x0c0a08, 0.012);
    }
    for (let i = 0; i < dustN; i++) {
      const q = seedAir[i];
      const z = 20 - (((q[2] + t * 0.09) % 1) * 110);
      dm.position.set((q[0] - 0.5) * 5.4, (q[1] - 0.5) * 4.2, z);
      dm.quaternion.identity(); dm.scale.setScalar(xsec ? 0.0001 : 1); dm.updateMatrix(); dust.setMatrixAt(i, dm.matrix);
    }
    dust.instanceMatrix.needsUpdate = true;
    cC.render();
  };
}
