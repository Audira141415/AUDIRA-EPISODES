// EP34 VORTEX GENERATOR — MANUSCRIPT: parchment-ink world. A wing cross-section with vortex generators,
// airflow ribbons, boundary-layer visualisation, stall zone, and a Boeing 707 silhouette.
// Three stations along x: WING (x=-30), DETAIL (x=0), HISTORY (x=30).
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, label } from "./lib3d.js";

const P = {
  parch: "#F0E4CE", parchD: "#D8C9A8", parchL: "#FAF3E2", ink: "#2C1810", inkL: "#5C4030",
  gold: "#C5933A", goldL: "#E8C876", goldD: "#8B6A20", red: "#8B3A2E", redL: "#C45A4A",
  blue: "#2E4A6E", blueL: "#5A7EA8", green: "#3A5C3A", greenL: "#5A8C5A",
  sky: "#C8D8E8", metal: "#A0A8B0", metalD: "#707880",
};
const NanGuard = { uniforms:{tDiffuse:{value:null}}, vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
const Grade = { uniforms:{tDiffuse:{value:null},flash:{value:0}}, vertexShader:NanGuard.vertexShader,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(.299,.587,.114));c=mix(c,c*vec3(1.05,1.0,0.91),0.55);c+=vec3(.03,.02,.01)*(1.0-l);
  c=mix(vec3(l),c,1.06);c=(c-.5)*1.06+.5;c=mix(c,vec3(1.0,.96,.88),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function pm(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: opts.rough ?? 0.88, metalness: opts.metal ?? 0, side: opts.ds ? THREE.DoubleSide : THREE.FrontSide,
    ...(opts.emi ? { emissive: new THREE.Color(opts.emi), emissiveIntensity: opts.ei ?? 0 } : {}) });
}
function mesh(geo, mat, parent, x=0, y=0, z=0) { const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function box(w,h,d,c,parent,x,y,z,o) { return mesh(new THREE.BoxGeometry(w,h,d), pm(c,o), parent, x,y,z); }
function cyl(rt,rb,h,c,parent,x,y,z,seg=24,o) { return mesh(new THREE.CylinderGeometry(rt,rb,h,seg), pm(c,o), parent, x,y,z); }

// Wing airfoil shape (NACA-like)
function airfoilShape(chord, thick) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const x = i / 40, y = thick * (0.2969*Math.sqrt(x) - 0.126*x - 0.3516*x*x + 0.2843*x*x*x - 0.1015*x*x*x*x);
    pts.push(new THREE.Vector2(x * chord - chord/2, y));
  }
  for (let i = 40; i >= 0; i--) {
    const x = i / 40, y = thick * (0.2969*Math.sqrt(x) - 0.126*x - 0.3516*x*x + 0.2843*x*x*x - 0.1015*x*x*x*x);
    pts.push(new THREE.Vector2(x * chord - chord/2, -y));
  }
  const shape = new THREE.Shape(pts);
  return shape;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xd8ccb0, fog: 0.004, exp: 0.9, bloom: [0.14, 0.45, 0.85] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.9;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  // Environment
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x8a7a60);
    for (const [w,h,c,i,x,y,z] of [[8,4,0xfff4dc,1.4,-3,4,3],[5,5,0xe8e4d0,0.7,4,2,2],[10,3,0xc8b890,0.5,0,-3,0]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));
      m.position.set(x,y,z); m.lookAt(0,0,0); s.add(m);
    }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.25;
  const A = k => { const v = AT[k]; if (v===undefined) console.warn("missing anchor",k); return v??0; };

  // Lights
  const hemi = new THREE.HemisphereLight(0xfff4dc, 0xc8b890, 1.4); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0d0, 2.4); key.castShadow = true; key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera, {left:-10,right:10,top:10,bottom:-10,near:1,far:70}); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  scene.add(key); scene.add(key.target);
  const backL = new THREE.DirectionalLight(0xffc880, 2.0); scene.add(backL); scene.add(backL.target);
  const fill = new THREE.DirectionalLight(0xe0e8f0, 0.5); scene.add(fill); scene.add(fill.target);

  // ========== STATION 1: WING with VGs (x=-30) ==========
  const WG = new THREE.Group(); WG.position.x = -30; scene.add(WG);
  // Ground plane (parchment)
  box(20, 0.2, 12, P.parchD, WG, 0, -2.1, 0);
  // Wing
  const wingShape = airfoilShape(8, 0.5);
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 8, bevelEnabled: false, curveSegments: 32 });
  wingGeo.rotateY(-Math.PI/2); wingGeo.translate(0, 0, 0);
  const wingMat = pm(P.metal, { rough: 0.6, metal: 0.3 });
  const wing = mesh(wingGeo, wingMat, WG, 0, 0, 0);
  // Vortex generator fins on top of wing
  const vgGroup = new THREE.Group(); WG.add(vgGroup);
  const finGeo = new THREE.BoxGeometry(0.04, 0.25, 0.15);
  const finMat = pm(P.red, { rough: 0.5 });
  for (let i = 0; i < 12; i++) {
    const fin = mesh(finGeo, finMat, vgGroup, -3.5 + i * 0.6, 0.55, -1.5);
    fin.rotation.y = (i % 2 === 0 ? 0.3 : -0.3);
  }
  // AUDIRA label on the wing
  const auTex = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = "rgba(240,228,206,0.8)"; g.fillRect(0,0,w,h);
    g.font = "bold 64px Georgia,serif"; g.fillStyle = P.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("AUDIRA", w/2, h/2);
  });
  const auPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshStandardMaterial({ map: auTex, transparent: true, roughness: 0.9 }));
  auPlane.position.set(0, 0.52, 1.5); auPlane.rotation.x = -Math.PI/2 + 0.1; WG.add(auPlane);
  // Airflow arrows (instanced cones)
  const arrowGeo = new THREE.ConeGeometry(0.06, 0.2, 8); arrowGeo.rotateZ(-Math.PI/2);
  const arrowMat = pm(P.blueL, { emi: P.blue, ei: 0.2 });
  const arrows = new THREE.InstancedMesh(arrowGeo, arrowMat, 40); arrows.frustumCulled = false; WG.add(arrows);
  // Boundary layer vis: flat ribbon
  const blGeo = new THREE.PlaneGeometry(6, 0.15, 30, 1);
  const blMat = pm(P.redL, { ds: true, emi: P.red, ei: 0.15 });
  const blMesh = mesh(blGeo, blMat, WG, 0, 0.5, 0); blMesh.visible = false;
  // Separation zone indicator
  const sepGeo = new THREE.PlaneGeometry(3, 1.5, 1, 1);
  const sepTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "rgba(139,58,46,0.3)";
    g.fillRect(0,0,w,h);
    g.font = "bold 40px Georgia,serif"; g.fillStyle = P.red; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("STALL ZONE", w/2, h/2);
  });
  const sepPlane = new THREE.Mesh(sepGeo, new THREE.MeshStandardMaterial({ map: sepTex, transparent: true, roughness: 0.9, side: THREE.DoubleSide }));
  sepPlane.position.set(2.5, 1.5, 0); sepPlane.visible = false; WG.add(sepPlane);

  // ========== STATION 2: DETAIL close-up vortex mechanism (x=0) ==========
  const DT = new THREE.Group(); DT.position.x = 0; scene.add(DT);
  box(10, 0.15, 8, P.parchD, DT, 0, -2, 0);
  // Single VG fin close-up
  const bigFin = mesh(new THREE.BoxGeometry(0.15, 1.0, 0.6), pm(P.red, {rough:0.4}), DT, 0, 0.5, 0);
  bigFin.rotation.y = 0.35;
  // Vortex spiral (torus knot as stylised vortex)
  const vortexGeo = new THREE.TorusGeometry(1.2, 0.06, 12, 60, Math.PI * 4);
  vortexGeo.rotateY(Math.PI/2);
  const vortexMat = pm(P.blueL, { emi: P.blue, ei: 0.3, ds: true });
  const vortex = mesh(vortexGeo, vortexMat, DT, 1.5, 0.8, 0);
  // Arrow at vortex tip
  const tipArrow = mesh(new THREE.ConeGeometry(0.15, 0.4, 8), pm(P.gold, {emi:P.goldL, ei:0.2}), DT, 3.0, 0.8, 0);
  tipArrow.rotation.z = -Math.PI/2;
  // Wing surface section
  box(6, 0.3, 4, P.metal, DT, 0, -0.15, 0, {rough:0.5, metal:0.3});
  // Labels
  const mkLabel = (text, x, y, z, color) => {
    const tx = canvasTex(512, 96, (g, w, h) => {
      g.font = "bold 48px Georgia,serif"; g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(text, w/2, h/2);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.38), new THREE.MeshStandardMaterial({map:tx,transparent:true,roughness:0.9}));
    m.position.set(x,y,z); DT.add(m); return m;
  };
  mkLabel("UDARA CEPAT", -1, 2.2, 0, P.blue);
  mkLabel("PUSARAN", 2, 2.2, 0, P.gold);
  mkLabel("LAPISAN LAMBAT", -1, -0.8, 0, P.red);

  // ========== STATION 3: HISTORY Boeing 707 (x=30) ==========
  const HI = new THREE.Group(); HI.position.x = 30; scene.add(HI);
  box(14, 0.15, 8, P.parchD, HI, 0, -2, 0);
  // Stylised Boeing 707 silhouette (fuselage + wings + tail)
  const fuselage = cyl(0.4, 0.4, 8, P.metalD, HI, 0, 0.5, 0, 16); fuselage.rotation.z = Math.PI/2;
  // Wings
  const wingGeo2 = new THREE.BoxGeometry(3.5, 0.08, 1.2);
  mesh(wingGeo2, pm(P.metal,{rough:0.5,metal:0.3}), HI, 0.5, 0.5, -0.8);
  mesh(wingGeo2, pm(P.metal,{rough:0.5,metal:0.3}), HI, 0.5, 0.5, 0.8);
  // Tail
  mesh(new THREE.BoxGeometry(0.08, 1.2, 0.5), pm(P.metal,{rough:0.5,metal:0.3}), HI, -3.8, 1.1, 0);
  // VG markers on wings (gold dots)
  for (let i = 0; i < 8; i++) {
    mesh(new THREE.SphereGeometry(0.06,8,8), pm(P.gold,{emi:P.goldL,ei:0.3}), HI, -0.5+i*0.3, 0.58, -0.9);
    mesh(new THREE.SphereGeometry(0.06,8,8), pm(P.gold,{emi:P.goldL,ei:0.3}), HI, -0.5+i*0.3, 0.58, 0.9);
  }
  // Counter panel: "4-10 knot"
  const counterTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = P.parch; g.fillRect(0,0,w,h);
    g.strokeStyle = P.gold; g.lineWidth = 6; g.strokeRect(10,10,w-20,h-20);
    g.font = "bold 80px Georgia,serif"; g.fillStyle = P.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("4–10 knot", w/2, h/2 - 20);
    g.font = "bold 36px Georgia,serif"; g.fillStyle = P.red;
    g.fillText("penurunan kecepatan stall", w/2, h/2 + 50);
  });
  const counterPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshStandardMaterial({map:counterTex, roughness:0.9}));
  counterPlane.position.set(0, 2.5, -2); HI.add(counterPlane);
  // AUDIRA stamp
  const stampTex = canvasTex(256, 64, (g,w,h) => {
    g.fillStyle = P.red; g.fillRect(0,0,w,h);
    g.font = "bold 40px Georgia,serif"; g.fillStyle = P.parch; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("AUDIRA", w/2, h/2);
  });
  mesh(new THREE.PlaneGeometry(1.5, 0.38), new THREE.MeshStandardMaterial({map:stampTex, roughness:0.9}), HI, 3, -1, 2);

  // ========== CAMERA ==========
  const camPath = track([
    [0, -28, 2.5, 7, -30, 0, 0],       // s1: looking at wing from above-front
    [K.s2, -30, 1.5, 5, -30, 0, -1],    // s2: closer to VGs
    [K.s3, -27, 1.0, 3, -30, 0.3, 0],   // s3: side view boundary layer
    [K.s4, -26, 2, 4, -30, 0, 0],       // s4: pull back, see separation
    [K.s5, -28, 3, 6, -30, 1, 0],       // s5: high angle stall
    [K.s6, 2, 2, 5, 0, 0.5, 0],         // s6: detail station
    [K.s7, 32, 3, 8, 30, 0.5, 0],       // s7: history station
    [K.s8, 30, 1.5, 5, 30, 0, 1],       // s8: close on plane
  ]);

  // ========== ANIMATE ==========
  const Ro = mulberry(34);
  const arrowObj = new THREE.Object3D();
  return (t) => {
    const cp = camPath(t);
    cam.position.set(cp[0], cp[1], cp[2]);
    cam.lookAt(cp[3], cp[4], cp[5]);
    // Lights follow camera
    key.position.set(cp[0]-4, cp[1]+6, cp[2]+4);
    key.target.position.set(cp[3], cp[4], cp[5]);
    backL.position.set(cp[3]+5, cp[4]+3, cp[5]-5);
    backL.target.position.set(cp[3], cp[4], cp[5]);
    fill.position.set(cp[0]+3, cp[1]+2, cp[2]-3);
    fill.target.position.set(cp[3], cp[4], cp[5]);
    // Arrows animation (airflow over wing)
    for (let i = 0; i < 40; i++) {
      const phase = ((t * 0.3 + i / 40) % 1);
      const x = -4 + phase * 8;
      const y = 0.7 + 0.3 * Math.sin(phase * Math.PI);
      arrowObj.position.set(x, y, -3.5 + (i % 5) * 1.5);
      arrowObj.rotation.set(0, 0, -0.1 + 0.2 * Math.sin(phase * Math.PI));
      const s = Math.sin(phase * Math.PI) * 0.8 + 0.2;
      arrowObj.scale.setScalar(s);
      arrowObj.updateMatrix();
      arrows.setMatrixAt(i, arrowObj.matrix);
    }
    arrows.instanceMatrix.needsUpdate = true;
    // Boundary layer visibility
    const blShow = clamp01((t - K.s3) / 0.5) * clamp01((K.s5 - t) / 0.5);
    blMesh.visible = blShow > 0.01;
    if (blMesh.visible) blMesh.material.opacity = blShow * 0.6;
    // Separation zone
    const sepShow = clamp01((t - A("s4:lepas")) / 0.5) * clamp01((K.s6 - t) / 0.5);
    sepPlane.visible = sepShow > 0.01;
    if (sepPlane.visible) sepPlane.material.opacity = sepShow * 0.5;
    // Vortex rotation
    vortex.rotation.x = t * 2;
    // Grade flash on scene changes
    let fl = 0;
    for (const s of ["s2","s3","s4","s5","s6","s7","s8"]) { const d = t - K[s]; if (d > 0 && d < 0.3) fl = Math.max(fl, (1 - d/0.3) * 0.15); }
    gradeP.uniforms.flash.value = fl;
    comp.render();
  };
}
