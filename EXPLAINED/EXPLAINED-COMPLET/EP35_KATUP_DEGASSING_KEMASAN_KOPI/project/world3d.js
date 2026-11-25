// EP35 KATUP DEGASSING — FOODFORGE: warm coffee kitchen. A coffee bag with one-way valve,
// roasted beans, CO₂ gas bubbles, valve cutaway mechanism, Goglio factory counter.
// Three stations: ROAST (x=-30), VALVE (x=0), HISTORY (x=30).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, label } from "./lib3d.js";

const P = {
  coffee: "#3C2415", coffeeL: "#5C3A25", cream: "#F5E6D0", creamD: "#E0D0B8",
  copper: "#B87333", copperL: "#D4955A", copperD: "#8A5520",
  wood: "#8B6B47", woodD: "#6A5030", caramel: "#D4A574",
  ceramic: "#E8DDD0", green: "#4A6741", greenL: "#6A8A60",
  rubber: "#2A2A2A", silicone: "#A0B8C0",
};
const NanGuard = { uniforms:{tDiffuse:{value:null}}, vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
const Grade = { uniforms:{tDiffuse:{value:null},flash:{value:0}}, vertexShader:NanGuard.vertexShader,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(.299,.587,.114));c=mix(c,c*vec3(1.04,0.98,0.90),0.6);c+=vec3(.03,.02,.01)*(1.0-l);
  c=mix(vec3(l),c,1.05);c=(c-.5)*1.05+.5;c=mix(c,vec3(1.0,.95,.85),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function pm(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0, side: opts.ds ? THREE.DoubleSide : THREE.FrontSide,
    ...(opts.emi ? { emissive: new THREE.Color(opts.emi), emissiveIntensity: opts.ei ?? 0 } : {}) });
}
function mesh(geo, mat, parent, x=0, y=0, z=0) { const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function box(w,h,d,c,parent,x,y,z,o) { return mesh(new THREE.BoxGeometry(w,h,d), pm(c,o), parent, x,y,z); }
function cyl(rt,rb,h,c,parent,x,y,z,seg=24,o) { return mesh(new THREE.CylinderGeometry(rt,rb,h,seg), pm(c,o), parent, x,y,z); }

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xd0c0a8, fog: 0.004, exp: 0.9, bloom: [0.12, 0.4, 0.8] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.9;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  // Environment
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x8a7560);
    for (const [w,h,c,i,x,y,z] of [[8,4,0xfff0d0,1.5,-3,4,3],[5,5,0xe8dcc0,0.8,4,2,2],[10,3,0xc8b898,0.5,0,-3,0]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));
      m.position.set(x,y,z); m.lookAt(0,0,0); s.add(m);
    }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.3;
  const A = k => { const v = AT[k]; if (v===undefined) console.warn("missing anchor",k); return v??0; };

  // Lights (kitchen studio)
  const hemi = new THREE.HemisphereLight(0xfff0d0, 0xc8b898, 1.3); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0c8, 2.5); key.castShadow = true; key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera, {left:-10,right:10,top:10,bottom:-10,near:1,far:70}); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(0xffc870, 2.0); scene.add(rim); scene.add(rim.target);
  const fill = new THREE.DirectionalLight(0xe0d8e0, 0.5); scene.add(fill); scene.add(fill.target);

  // ========== STATION 1: ROAST — coffee bag + beans (x=-30) ==========
  const RS = new THREE.Group(); RS.position.x = -30; scene.add(RS);
  // Wooden table
  box(16, 0.3, 10, P.wood, RS, 0, -2, 0, { rough: 0.9 });
  // Coffee bag (simplified as box with label)
  const bag = box(2.5, 3.5, 1.5, P.coffee, RS, 0, 0, 0, { rough: 0.95 });
  // Bag label
  const bagTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = P.cream; g.fillRect(20,20,w-40,h-40);
    g.strokeStyle = P.copper; g.lineWidth = 4; g.strokeRect(30,30,w-60,h-60);
    g.font = "bold 60px Georgia,serif"; g.fillStyle = P.coffee; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("KOPI", w/2, h/2 - 20);
    g.font = "bold 28px Georgia,serif"; g.fillStyle = P.copper;
    g.fillText("FRESH ROAST", w/2, h/2 + 30);
  });
  const bagLabel = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshStandardMaterial({ map: bagTex, roughness: 0.9 }));
  bagLabel.position.set(0, 0.2, 0.76); RS.add(bagLabel);
  // Valve button on bag
  const valve = cyl(0.15, 0.15, 0.08, P.copperD, RS, 0.6, 1.2, 0.76, 16, { rough: 0.4, metal: 0.5 });
  // Scattered beans
  const beanGeo = new THREE.SphereGeometry(0.15, 8, 6);
  beanGeo.scale(1, 0.7, 1.3);
  const beanMat = pm(P.coffeeL, { rough: 0.8 });
  const Ro = mulberry(35);
  for (let i = 0; i < 20; i++) {
    const b = mesh(beanGeo, beanMat, RS, -2 + Ro() * 4, -1.7, -2 + Ro() * 4);
    b.rotation.set(Ro() * 3, Ro() * 3, Ro() * 3);
  }
  // Gas bubbles (instanced spheres for CO2)
  const bubGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const bubMat = pm(P.creamD, { emi: P.cream, ei: 0.3 });
  const bubbles = new THREE.InstancedMesh(bubGeo, bubMat, 30); bubbles.frustumCulled = false; RS.add(bubbles);
  // AUDIRA on bag side
  const auTex = canvasTex(512, 96, (g, w, h) => {
    g.fillStyle = "rgba(245,230,208,0.7)"; g.fillRect(0,0,w,h);
    g.font = "bold 56px Georgia,serif"; g.fillStyle = P.coffee; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("AUDIRA", w/2, h/2);
  });
  const auPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.38), new THREE.MeshStandardMaterial({ map: auTex, transparent: true, roughness: 0.9 }));
  auPlane.position.set(-1.26, 0, 0); auPlane.rotation.y = -Math.PI/2; RS.add(auPlane);
  // Swelling indicator (second bag, grows)
  const swellBag = box(2.5, 3.5, 1.5, P.coffeeL, RS, -4, 0, 0, { rough: 0.95 });
  swellBag.visible = false;

  // ========== STATION 2: VALVE cutaway mechanism (x=0) ==========
  const VL = new THREE.Group(); VL.position.x = 0; scene.add(VL);
  box(10, 0.2, 8, P.ceramic, VL, 0, -2, 0, { rough: 0.7 });
  // Ceramic plate base
  cyl(3, 3, 0.3, P.ceramic, VL, 0, -1.7, 0, 32, { rough: 0.6 });
  // Valve housing (copper cylinder cutaway)
  const housing = cyl(1.2, 1.2, 2.0, P.copper, VL, 0, 0, 0, 32, { rough: 0.4, metal: 0.6 });
  // Inner bore
  cyl(0.8, 0.8, 2.1, P.cream, VL, 0, 0, 0, 32, { rough: 0.9 });
  // Rubber disc (piringan karet)
  const disc = cyl(0.7, 0.7, 0.08, P.rubber, VL, 0, 0.3, 0, 24, { rough: 0.95 });
  // Silicone oil layer
  const oil = cyl(0.75, 0.75, 0.04, P.silicone, VL, 0, 0.22, 0, 24, { rough: 0.3, metal: 0.1 });
  // Small hole at bottom
  cyl(0.15, 0.15, 0.5, P.coffee, VL, 0, -0.5, 0, 12);
  // Labels
  const mkLabel = (text, x, y, z, color) => {
    const tx = canvasTex(512, 96, (g, w, h) => {
      g.font = "bold 44px Georgia,serif"; g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(text, w/2, h/2);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42), new THREE.MeshStandardMaterial({map:tx,transparent:true,roughness:0.9}));
    m.position.set(x,y,z); VL.add(m); return m;
  };
  mkLabel("PIRINGAN KARET", -2.2, 0.5, 0, P.coffee);
  mkLabel("MINYAK SILIKON", -2.2, -0.1, 0, P.silicone);
  mkLabel("GAS CO₂ →", -2.2, -0.8, 0, P.green);
  // Pressure arrows (instanced)
  const arrowGeo = new THREE.ConeGeometry(0.05, 0.18, 8); arrowGeo.rotateZ(Math.PI);
  const arrowMat = pm(P.greenL, { emi: P.green, ei: 0.2 });
  const arrows = new THREE.InstancedMesh(arrowGeo, arrowMat, 12); arrows.frustumCulled = false; VL.add(arrows);

  // ========== STATION 3: HISTORY Goglio (x=30) ==========
  const HI = new THREE.Group(); HI.position.x = 30; scene.add(HI);
  box(14, 0.2, 8, P.wood, HI, 0, -2, 0, { rough: 0.9 });
  // Factory building silhouette
  box(6, 3, 2, P.creamD, HI, 0, 0, -1, { rough: 0.8 });
  box(2, 1.5, 2.1, P.copper, HI, 0, 2.5, -1, { rough: 0.5, metal: 0.4 });
  // "1968" counter
  const yearTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = P.cream; g.fillRect(0,0,w,h);
    g.strokeStyle = P.copper; g.lineWidth = 6; g.strokeRect(10,10,w-20,h-20);
    g.font = "bold 100px Georgia,serif"; g.fillStyle = P.coffee; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("1968", w/2, h/2 - 20);
    g.font = "bold 32px Georgia,serif"; g.fillStyle = P.copper;
    g.fillText("Goglio · Italia", w/2, h/2 + 50);
  });
  mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshStandardMaterial({map:yearTex, roughness:0.9}), HI, 0, 2, 1.1);
  // Billion counter
  const billTex = canvasTex(512, 192, (g, w, h) => {
    g.fillStyle = P.cream; g.fillRect(0,0,w,h);
    g.strokeStyle = P.copperD; g.lineWidth = 4; g.strokeRect(8,8,w-16,h-16);
    g.font = "bold 64px Georgia,serif"; g.fillStyle = P.coffee; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("1.000.000.000+", w/2, h/2 - 10);
    g.font = "bold 28px Georgia,serif"; g.fillStyle = P.copper;
    g.fillText("katup per tahun", w/2, h/2 + 40);
  });
  mesh(new THREE.PlaneGeometry(3, 1.1), new THREE.MeshStandardMaterial({map:billTex, roughness:0.9}), HI, 0, -0.5, 2);
  // Conveyor belt of valves
  for (let i = 0; i < 8; i++) {
    cyl(0.12, 0.12, 0.06, P.copperD, HI, -3 + i * 0.85, -1.2, 2, 12, { rough: 0.4, metal: 0.5 });
  }
  // AUDIRA stamp
  const stampTex = canvasTex(256, 64, (g,w,h) => {
    g.fillStyle = P.copper; g.fillRect(0,0,w,h);
    g.font = "bold 40px Georgia,serif"; g.fillStyle = P.cream; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("AUDIRA", w/2, h/2);
  });
  mesh(new THREE.PlaneGeometry(1.5, 0.38), new THREE.MeshStandardMaterial({map:stampTex, roughness:0.9}), HI, 4, -1, 2.5);

  // ========== CAMERA ==========
  const camPath = track([
    [0, -28, 2, 6, -30, 0, 0],        // s1: looking at bag
    [K.s2, -30, 1.5, 4, -30, 0.5, 0], // s2: closer, see valve button
    [K.s3, -27, 2, 5, -30, 0, 0],     // s3: pull back, see swelling
    [K.s4, -29, 3, 6, -30, 1, 0],     // s4: high angle, oxygen threat
    [K.s5, -26, 2, 4, -30, 0, 1],     // s5: history intro
    [K.s6, 2, 1.5, 5, 0, 0, 0],       // s6: valve cutaway detail
    [K.s7, 32, 3, 8, 30, 0.5, 0],     // s7: factory / history
    [K.s8, 30, 1, 4, 30, -0.5, 1],    // s8: close on counters
  ]);

  // ========== ANIMATE ==========
  const arrowObj = new THREE.Object3D();
  return (t) => {
    const cp = camPath(t);
    cam.position.set(cp[0], cp[1], cp[2]);
    cam.lookAt(cp[3], cp[4], cp[5]);
    key.position.set(cp[0]-4, cp[1]+6, cp[2]+4);
    key.target.position.set(cp[3], cp[4], cp[5]);
    rim.position.set(cp[3]+5, cp[4]+3, cp[5]-5);
    rim.target.position.set(cp[3], cp[4], cp[5]);
    fill.position.set(cp[0]+3, cp[1]+2, cp[2]-3);
    fill.target.position.set(cp[3], cp[4], cp[5]);
    // Gas bubbles rising from bag
    for (let i = 0; i < 30; i++) {
      const phase = ((t * 0.2 + i / 30) % 1);
      arrowObj.position.set(-30 + (i % 5 - 2) * 0.4, -0.5 + phase * 3, (i % 3 - 1) * 0.3);
      const s = Math.sin(phase * Math.PI) * 0.7 + 0.3;
      arrowObj.scale.setScalar(s);
      arrowObj.updateMatrix();
      bubbles.setMatrixAt(i, arrowObj.matrix);
    }
    bubbles.instanceMatrix.needsUpdate = true;
    // Swell bag in s3
    const swellF = clamp01((t - K.s3) / 2) * clamp01((K.s5 - t) / 1);
    swellBag.visible = swellF > 0.01;
    if (swellBag.visible) swellBag.scale.set(1, 1, 1 + swellF * 0.5);
    // Valve disc flex in s6 (piringan melengkung)
    const flexF = clamp01((t - A("s6:mendorong")) / 0.8) * clamp01((A("s6:kembali") - t) / 0.5);
    disc.position.y = 0.3 + flexF * 0.15;
    disc.scale.set(1, 1 - flexF * 0.3, 1);
    // Pressure arrows
    for (let i = 0; i < 12; i++) {
      const phase = ((t * 0.4 + i / 12) % 1);
      const y = -0.8 + phase * 1.2;
      arrowObj.position.set((i % 3 - 1) * 0.2, y, (i % 4 - 1.5) * 0.15);
      const s = Math.sin(phase * Math.PI) * 0.6 + 0.2;
      arrowObj.scale.setScalar(s);
      arrowObj.updateMatrix();
      arrows.setMatrixAt(i, arrowObj.matrix);
    }
    arrows.instanceMatrix.needsUpdate = true;
    // Grade flash
    let fl = 0;
    for (const s of ["s2","s3","s4","s5","s6","s7","s8"]) { const d = t - K[s]; if (d > 0 && d < 0.3) fl = Math.max(fl, (1 - d/0.3) * 0.15); }
    gradeP.uniforms.flash.value = fl;
    comp.render();
  };
}
