// EP03 THE SLIDING CIRCLE. A studio-lit CVT: two conical pulleys, a belt of elements that keeps its length while the pulleys change diameter,
// centrifugal rollers, the YECVT motor and sensors, then a D-CVT split gear. Units: centimetres. Pulley axes run along z.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, skyEnv, box, cyl, std } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;
const X1 = -11, X2 = 11, D = X2 - X1, BW = 2.0;
const RMAX = 9.5, RIN = 1.2, CONE = 2.2 / (RMAX - RIN);
const yFace = (r) => 0.4 + (RMAX - r) * CONE;

// Belt length for an open belt over two circles; solve the rear radius that keeps it constant.
function beltLen(r1, r2) {
  const phi = Math.acos((r1 - r2) / D);
  return r1 * (2 * Math.PI - 2 * phi) + r2 * 2 * phi + 2 * Math.sqrt(D * D - (r1 - r2) ** 2);
}
const L0 = beltLen(3.0, 8.4);
function rearFor(r1) {
  let a = 2.0, b = 9.2;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (beltLen(r1, m) > L0) b = m; else a = m; }
  return (a + b) / 2;
}
// Point and tangent angle on the belt at arc length s.
function beltAt(r1, r2, s) {
  const phi = Math.acos((r1 - r2) / D), T = Math.sqrt(D * D - (r1 - r2) ** 2);
  const a1 = r1 * (2 * Math.PI - 2 * phi), a2 = r2 * 2 * phi, L = a1 + a2 + 2 * T;
  s = ((s % L) + L) % L;
  if (s < a1) { const th = phi + s / r1; return [X1 + r1 * Math.cos(th), r1 * Math.sin(th), th]; }
  s -= a1;
  const pB1 = [X1 + r1 * Math.cos(-phi), r1 * Math.sin(-phi)], pB2 = [X2 + r2 * Math.cos(-phi), r2 * Math.sin(-phi)];
  if (s < T) { const u = s / T; return [pB1[0] + (pB2[0] - pB1[0]) * u, pB1[1] + (pB2[1] - pB1[1]) * u, -phi]; }
  s -= T;
  if (s < a2) { const th = -phi + s / r2; return [X2 + r2 * Math.cos(th), r2 * Math.sin(th), th]; }
  s -= a2;
  const pT2 = [X2 + r2 * Math.cos(phi), r2 * Math.sin(phi)], pT1 = [X1 + r1 * Math.cos(phi), r1 * Math.sin(phi)];
  const u = s / T; return [pT2[0] + (pT1[0] - pT2[0]) * u, pT2[1] + (pT1[1] - pT2[1]) * u, phi];
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.5, 4000);
  const rnd = mulberry(303);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    yecvt2: A_("s2:YECVT", s.s2 + 6), dcvt2: A_("s2:D-CVT", s.s2 + 9),
    depan3: A_("s3:depan", s.s3 + 0.4), belakang3: A_("s3:belakang", s.s3 + 2), kerucut: A_("s3:kerucut", s.s3 + 5), sabuk3: A_("s3:Sabuk", s.s3 + 8),
    renggang: A_("s4:renggang", s.s4 + 2), rapat: A_("s4:rapat", s.s4 + 5), satu: A_("s4:satu", s.s4 + 8),
    roller: A_("s5:roller", s.s5 + 3), mulus: A_("s5:mulus", s.s5 + 10),
    motor: A_("s6:motor", s.s6 + 3), sensor: A_("s6:sensor", s.s6 + 6), mode: A_("s6:mode", s.s6 + 8), tiga: A_("s6:tiga", s.s6 + 10),
    gigi7: A_("s7:gigi", s.s7 + 4), dibagi: A_("s7:dibagi", s.s7 + 7), persen: A_("s7:persen", s.s7 + 10),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color(0x15171b);
  S.environment = skyEnv(r, 0xf4f6f8, 0x50565e, 0x0c0d10, v3(-0.3, 1, 0.5), 0xffffff, 2);
  S.environmentIntensity = 1.1;
  // cyclorama floor with soft falloff
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), std(0x2a2d33, 0.55, 0.15));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -24; floor.receiveShadow = true; S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(800, 400), new THREE.ShaderMaterial({
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vU;void main(){float g=exp(-pow((vU.y-.42)*4.,2.))*.6+.08;float x=exp(-pow((vU.x-.5)*3.,2.));gl_FragColor=vec4(vec3(.16,.17,.19)*g*(.5+.8*x),1.);}",
  }));
  back.position.set(0, 60, -120); S.add(back);
  const key = new THREE.SpotLight(0xffffff, 60000, 0, 0.5, 0.7, 1.6); key.position.set(-60, 110, 90); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; S.add(key, key.target);
  const strip = new THREE.RectAreaLight ? null : null;
  const fill = new THREE.DirectionalLight(0x9fc4ff, 0.7); fill.position.set(80, 30, 60); S.add(fill);
  const rim = new THREE.DirectionalLight(0xffb27a, 1.6); rim.position.set(30, 50, -90); S.add(rim);

  const steel = new THREE.MeshPhysicalMaterial({ color: 0xc9ced4, roughness: 0.22, metalness: 1, clearcoat: 0.3 });
  const steelGlass = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
  const dark = std(0x2b2f35, 0.4, 0.8);
  const prof = [[RIN, 0], [RMAX, 0], [RMAX, 0.4], [RIN, 0.4 + (RMAX - RIN) * CONE], [RIN * 0.9, 0.4 + (RMAX - RIN) * CONE]].map(([a, b]) => new THREE.Vector2(a, b));
  const sheaveGeo = new THREE.LatheGeometry(prof, 72);
  sheaveGeo.rotateX(Math.PI / 2); // lathe axis y -> z; cone grows toward +z
  // camera-side sheaves are cut away above the axis so the belt shows
  const cutGeo = new THREE.LatheGeometry(prof, 48, -Math.PI / 2, Math.PI);
  cutGeo.rotateX(Math.PI / 2);
  const cutM = new THREE.MeshPhysicalMaterial({ color: 0xc9ced4, roughness: 0.25, metalness: 1, side: THREE.DoubleSide });
  const mkSheave = (mat, flip, geo = sheaveGeo) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
    if (flip) m.scale.z = -1;
    g.add(m);
    // machining marks: thin rings on the back face
    for (let k = 0; k < 3; k++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(3 + k * 2.2, 0.06, 6, 64), dark); rg.position.z = flip ? 0.02 : -0.02; g.add(rg); }
    return g;
  };
  const P1 = new THREE.Group(), P2 = new THREE.Group();
  P1.position.x = X1; P2.position.x = X2; S.add(P1, P2);
  const f1 = mkSheave(steel, false), m1 = mkSheave(cutM, true, cutGeo);
  const f2 = mkSheave(cutM, true, cutGeo), m2 = mkSheave(steel, false);
  P1.add(f1, m1); P2.add(f2, m2);
  const shaft1 = cyl(1.0, 1.0, 34, 24, dark, 0, 0, -4, P1); shaft1.rotation.x = Math.PI / 2;
  const shaft2 = cyl(1.2, 1.2, 34, 24, dark, 0, 0, -4, P2); shaft2.rotation.x = Math.PI / 2;
  // ramp plate and rollers behind the moving front sheave
  const rampPlate = cyl(7.6, 7.6, 0.6, 48, dark, 0, 0, 0, P1); rampPlate.rotation.x = Math.PI / 2;
  const NR = 6;
  const rollerM = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.35, metalness: 0.3, emissive: 0xff6a1a, emissiveIntensity: 0 });
  const rollers = [];
  const rollerG = new THREE.Group(); P1.add(rollerG);
  for (let i = 0; i < NR; i++) { const m = cyl(0.95, 0.95, 1.5, 20, rollerM, 0, 0, 0, rollerG); rollers.push(m); }
  // rear spring
  const springPts = [];
  for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2 * 7; springPts.push(v3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, -i / 240 * 6)); }
  const spring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPts), 400, 0.28, 6), std(0x9aa1aa, 0.3, 0.9));
  P2.add(spring);

  // belt: elements that ride the loop
  const NE = 150;
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x24252a, roughness: 0.7, metalness: 0.1, emissive: 0xff6a1a, emissiveIntensity: 0 });
  const belt = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 1.0, BW), beltMat, NE);
  belt.castShadow = true; belt.frustumCulled = false; S.add(belt);
  const dm = new THREE.Object3D();

  // YECVT parts: drive motor, gear, sensors, control unit, signal lines
  const ye = new THREE.Group(); S.add(ye);
  const motorM = std(0x3a3f47, 0.35, 0.8);
  const motor = cyl(2.6, 2.6, 7, 28, motorM, X1 - 2, -14, 6, ye); motor.rotation.z = Math.PI / 2;
  const pin = cyl(0.6, 0.6, 3, 12, dark, X1 + 2.5, -14, 6, ye); pin.rotation.z = Math.PI / 2;
  const glowM = (c) => new THREE.MeshBasicMaterial({ color: c });
  const sens1 = box(1.8, 1.2, 1.2, glowM(new THREE.Color(0.3, 2.2, 3)), X1, -10.8, 3, ye);
  const sens2 = box(1.8, 1.2, 1.2, glowM(new THREE.Color(0.3, 2.2, 3)), X2, -10.8, 3, ye);
  const tcu = box(7, 4, 2, std(0x1a1d22, 0.4, 0.6), 0, -19, 8, ye);
  const tcuLed = box(5.4, 0.5, 0.2, glowM(new THREE.Color(0.3, 2.2, 3)), 0, -18, 9.1, ye);
  const lineM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.2, 3), transparent: true, opacity: 0 });
  const mkLine = (pts) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.15, 6), lineM); ye.add(m); return m; };
  mkLine([v3(X1, -11.4, 3), v3(X1 + 3, -16, 6), v3(-2, -19, 8)]);
  mkLine([v3(X2, -11.4, 3), v3(X2 - 3, -16, 6), v3(2, -19, 8)]);
  mkLine([v3(-3.5, -19, 8), v3(X1, -17, 7), v3(X1 - 2, -14, 6)]);
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(0.45, 10, 8), glowM(new THREE.Color(1, 3.5, 4.5)), 12);
  pulses.frustumCulled = false; ye.add(pulses);

  // D-CVT split gear: a gear pair behind the pulleys on the same shafts, centre distance = pulley distance
  const gear = (rad, teeth, depth, mat) => {
    const shp = new THREE.Shape();
    const ro = rad + 0.8, ri = rad - 0.8;
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2, a1 = a0 + Math.PI * 2 / teeth;
      const q = (a1 - a0) / 4;
      const pts = [[ri, a0], [ro, a0 + q], [ro, a0 + 2 * q], [ri, a0 + 3 * q]];
      pts.forEach(([rr, a], j) => (i === 0 && j === 0 ? shp.moveTo(rr * Math.cos(a), rr * Math.sin(a)) : shp.lineTo(rr * Math.cos(a), rr * Math.sin(a))));
    }
    shp.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 1.3, 0, Math.PI * 2, true); shp.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shp, { depth, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 1 });
    g.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; return m;
  };
  const gearM = new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.3, metalness: 1, emissive: 0x38e1ff, emissiveIntensity: 0 });
  const g1 = gear(8.4, 34, 2.4, gearM), g2 = gear(13.6, 55, 2.4, gearM);
  g1.position.set(X1, 0, -13); g2.position.set(X2 + 0, 0, -13);
  const dc = new THREE.Group(); dc.add(g1, g2); S.add(dc);
  g2.position.x = X1 + 8.4 + 13.6;

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.45, 0.4, 1.2));
  comp.addPass(new OutputPass());

  // Ratio programme: u=0 is "gear one" (small front circle), u=1 is overdrive.
  function ratioU(t) {
    if (t < s.s2) return 0.5 + 0.45 * Math.sin(t * 0.9);
    if (t < s.s3) return 0.5 + 0.35 * Math.sin((t - s.s2) * 0.6);
    if (t < s.s4) return 0.55;
    if (t < s.s5) return 0.55 * (1 - ramp(t, E.renggang - 0.6, E.renggang + 0.8));
    if (t < s.s6) return ramp(t, E.roller - 0.3, E.mulus + 0.6);
    if (t < s.s7) {
      const base = 0.3 + 0.25 * ramp(t, E.mode - 0.3, E.mode + 0.8);
      const lv = t > E.tiga ? Math.floor(((t - E.tiga) / 0.9) % 3) : -1;
      return lv < 0 ? base : 0.3 + lv * 0.3;
    }
    if (t < s.s8) return 0.35 + 0.6 * ramp(t, s.s7 + 0.5, E.dibagi);
    return 0.5 + 0.3 * Math.sin((t - s.s8) * 0.8);
  }
  function rpm(t) { return t < s.s4 ? 7 : t < s.s5 ? 4 + 4 * ramp(t, E.satu - 1, E.satu) : t < s.s6 ? 5 + 6 * ramp(t, E.roller - 0.5, E.mulus) : 7; }
  const look = (p, q) => { cam.position.copy(p); cam.lookAt(q); };
  const lv = (a, b, u) => a.clone().lerp(b, u);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    // integrate angles so speed changes stay continuous
    let a1 = 0, sb = 0;
    const dt = 1 / 30;
    for (let x = 0; x < t; x += dt) {
      const u = ratioU(x), r1 = 3 + 5.4 * u;
      const w = rpm(x);
      a1 += w * dt; sb += w * r1 * dt;
    }
    const u = ratioU(t);
    const R1 = 3 + 5.4 * u, R2 = rearFor(R1);
    const a2 = (sb / R2);
    // sheave spacing: belt of width BW sits where the cone gap equals BW
    const explode = t >= s.s3 && t < s.s4 ? ramp(t, E.kerucut - 0.3, E.kerucut + 0.8) * (1 - ramp(t, E.sabuk3 - 0.2, E.sabuk3 + 0.8)) : 0;
    const off1 = BW / 2 + yFace(R1), off2 = BW / 2 + yFace(R2);
    f1.position.z = -off1 - explode * 6; m1.position.z = off1 + explode * 6;
    f2.position.z = off2 + explode * 6; m2.position.z = -off2 - explode * 6;
    f1.rotation.z = shaft1.rotation.y = -a1;
    m2.rotation.z = -a2;
    // rollers sit behind the moving sheave and slide out with the ratio
    rampPlate.position.z = off1 + 3.3 + explode * 6;
    rollerG.position.z = off1 + 2.5 + explode * 6;
    rollerG.rotation.z = -a1;
    const rr = 2.6 + 4.2 * u;
    rollers.forEach((m, i) => { const a = (i / NR) * Math.PI * 2; m.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0); m.rotation.set(0, 0, a); });
    const showRollers = t >= s.s5 && t < s.s6;
    rollerM.color.set(showRollers ? 0xffa040 : 0x6f5a48);
    rollerM.emissiveIntensity = showRollers ? 0.6 * ramp(t, E.roller - 0.2, E.roller + 0.4) : 0;
    steelGlass.opacity = showRollers ? 0.3 - 0.15 * ramp(t, s.s5 + 0.2, E.roller) : 0.3;
    const yecvt = t >= s.s6 && t < s.s7;
    rollerG.visible = !yecvt && t < s.s7;
    rampPlate.visible = false;
    spring.position.z = -off2 - 0.6 - explode * 6;
    spring.scale.z = 0.55 + 0.6 * (yFace(R2) / yFace(2));
    // belt elements
    const L = beltLen(R1, R2);
    const phase = sb;
    for (let i = 0; i < NE; i++) {
      const [x, y, th] = beltAt(R1, R2, phase + (i / NE) * L);
      dm.position.set(x, y, 0); dm.rotation.set(0, 0, th + Math.PI / 2); dm.scale.set(1, 1, 1); dm.updateMatrix();
      belt.setMatrixAt(i, dm.matrix);
    }
    belt.instanceMatrix.needsUpdate = true;
    // car belt in D-CVT chapter: silver push-belt elements
    const car = t >= s.s7 && t < s.s8 + 0.01;
    beltMat.color.set(car ? 0xb8bec6 : 0x1c1d20);
    beltMat.metalness = car ? 0.95 : 0.1; beltMat.roughness = car ? 0.25 : 0.7;
    const split = car ? ramp(t, E.gigi7 - 0.3, E.gigi7 + 0.6) : 0;
    const flow = car ? ramp(t, E.dibagi - 0.2, E.dibagi + 0.6) : 0;
    beltMat.emissiveIntensity = flow * 0.35 * (0.6 + 0.4 * Math.sin(t * 6));
    gearM.emissiveIntensity = flow * 0.5 * (0.6 + 0.4 * Math.sin(t * 6 + 1.5));
    dc.visible = split > 0.01;
    dc.position.y = (1 - split) * -30;
    g1.rotation.z = -a1; g2.rotation.z = a1 * 8.4 / 13.6 + 0.05;
    // YECVT
    ye.visible = yecvt;
    const yo = yecvt ? ramp(t, E.motor - 0.4, E.motor + 0.6) : 0;
    ye.position.y = (1 - yo) * -12;
    motor.rotation.x = t * 12 * (0.3 + Math.abs(Math.sin(t * 2)));
    lineM.opacity = yecvt ? ramp(t, E.sensor - 0.2, E.sensor + 0.5) : 0;
    for (let i = 0; i < 12; i++) {
      const k = i % 3, q = ((t * 0.9 + i / 12) % 1);
      const pts = k === 0 ? [v3(X1, -11.4, 3), v3(-2, -19, 8)] : k === 1 ? [v3(X2, -11.4, 3), v3(2, -19, 8)] : [v3(-3.5, -19, 8), v3(X1 - 2, -14, 6)];
      dm.position.copy(lv(pts[0], pts[1], q)); dm.scale.setScalar(lineM.opacity); dm.rotation.set(0, 0, 0); dm.updateMatrix(); pulses.setMatrixAt(i, dm.matrix);
    }
    pulses.instanceMatrix.needsUpdate = true;

    // cameras
    if (t < s.s2) {
      const q = t / s.s2;
      look(v3(-34 + 40 * q, 22 - 6 * q, 104 - 6 * q), v3(0, -8, 0));
    } else if (t < s.s3) {
      const q = (t - s.s2) / (s.s3 - s.s2);
      look(v3(24 - 18 * q, 30, 106), v3(0, -8, 0));
    } else if (t < s.s4) {
      const q = (t - s.s3) / (s.s4 - s.s3);
      const ex = explode;
      look(lv(v3(-62, 18, 84), v3(-88, 26, 30), ex).add(v3(10 * q, 0, 0)), v3(-2, -8, 0));
    } else if (t < s.s5) {
      const q = (t - s.s4) / (s.s5 - s.s4);
      look(v3(-6 + 4 * q, 8, 118 - 8 * q), v3(0, -12, 0));
    } else if (t < s.s6) {
      const q = (t - s.s5) / (s.s6 - s.s5);
      look(v3(-30 + 8 * q, 34, 62 - 6 * q), v3(X1 + 2, 0, 2));
    } else if (t < s.s7) {
      const q = (t - s.s6) / (s.s7 - s.s6);
      look(v3(-34 + 20 * q, -2, 92), v3(0, -16, 2));
    } else if (t < s.s8) {
      const q = (t - s.s7) / (s.s7 > 0 ? s.s8 - s.s7 : 1);
      look(v3(46 - 24 * q, 30, 100 - 10 * q), v3(0, -9, -6));
    } else {
      const q = ramp(t, s.s8, s.dur);
      look(v3(-20 - 40 * q, 30 + 20 * q, 110 + 40 * q), v3(0, -8, 0));
    }
    comp.render();
  };
}
