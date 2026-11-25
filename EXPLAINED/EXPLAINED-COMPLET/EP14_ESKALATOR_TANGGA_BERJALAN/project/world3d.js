// EP14 ESKALATOR — FELTCRAFT world. Three connected felt dioramas:
//   HISTORY  x=-40  Coney Island boardwalk (1896) / Paris expo (1900) with felt ramp and early escalator
//   MECHANISM x=0   cutaway escalator: felt steps on yarn chain, bead wheels on felt-strip rails, felt motor,
//                   comb plate with zigzag felt, handrail loop, belly return path
//   ETYMOLOGY x=40  felt signboard with "SCALA" → "ESCALATOR" lettering, trademark stamp
// Every value is a pure function of t. No accumulated state. Seeded randomness via mulberry().
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const P = {
  skyFelt: "#BFD9E6", hillFar: "#5E8A55", hillMid: "#86AE5E", hillNear: "#B5CF7A",
  ground: "#C8B48A", path: "#E9DDC0", stitchCream: "#FFF6E3", stitchRust: "#B5532F",
  yarnBrown: "#7A4E2E", yarnGreen: "#4F8A4B", apple: "#D8433A", buttonSun: "#F2B53B",
  spool: "#D9B98C", foxOrange: "#E37A2E", foxCream: "#F7E8D0", foxDark: "#4A2A1A",
  scarf: "#3E9C95", cheek: "#F29AA0", bead: "#14100E",
  keyWarm: "#FFE4BC", skyFill: "#D7E8FF", groundBounce: "#E8C99A",
  hudInk: "#4A2E1E", hudPaper: "#FFF7E8", hudAccent: "#C9563A",
};

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(1.04,1.01,0.93),0.55);c+=vec3(0.03,0.02,0.01)*(1.0-l);
  c=mix(vec3(l),c,1.06);c=(c-0.5)*1.06+0.5;c=mix(c,vec3(1.0,0.98,0.92),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// felt material helper: rough, sheen, cloth-like
function fm(color, opts = {}) {
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c, roughness: 1, metalness: 0, sheen: 1, sheenRoughness: 0.75,
    sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.45),
    flatShading: opts.flat || false, side: opts.side || THREE.FrontSide
  });
}
function beadMat() { return new THREE.MeshPhysicalMaterial({ color: P.bead, roughness: 0.08, clearcoat: 1, metalness: 0 }); }
function yarnMat(color) { return new THREE.MeshPhysicalMaterial({ color, roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#fff"), 0.3) }); }

// shapes
function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function cyl(rt, rb, h, seg) { return new THREE.CylinderGeometry(rt, rb, h, seg || 16); }
function sph(r, ws, hs) { return new THREE.SphereGeometry(r, ws || 16, hs || 12); }

// stitch line: instanced capsule bars along a path
function stitchLine(points, color, parent, spacing = 0.3, barLen = 0.12) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 1 });
  const geo = new THREE.CapsuleGeometry(0.02, barLen, 4, 8);
  const count = Math.floor(points.length / spacing);
  if (count < 1) return;
  const im = new THREE.InstancedMesh(geo, mat, Math.min(count, 200));
  const dummy = new THREE.Object3D();
  for (let i = 0; i < im.count; i++) {
    const idx = (i * spacing) % points.length;
    const fi = Math.floor(idx), ci = Math.min(fi + 1, points.length - 1), fr = idx - fi;
    const px = points[fi].x * (1 - fr) + points[ci].x * fr;
    const py = points[fi].y * (1 - fr) + points[ci].y * fr;
    const pz = points[fi].z * (1 - fr) + points[ci].z * fr;
    dummy.position.set(px, py, pz);
    dummy.rotation.set(0, 0, Math.PI / 4 * ((i % 2) * 2 - 1));
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
  }
  parent.add(im);
}

// escalator step: a felt block with two bead wheels
function makeStep(parent, y, z, tiltDeg, R) {
  const g = new THREE.Group();
  // step surface
  const step = new THREE.Mesh(box(1.8, 0.18, 0.7), fm(P.hillNear, { flat: true }));
  step.position.set(0, 0.09, 0);
  step.castShadow = true;
  g.add(step);
  // grooves on step surface
  for (let i = -3; i <= 3; i++) {
    const groove = new THREE.Mesh(box(0.03, 0.19, 0.68), fm(P.hillMid));
    groove.position.set(i * 0.22, 0.09, 0);
    g.add(groove);
  }
  // front wheel pair
  const wm = beadMat();
  const wg = cyl(0.1, 0.1, 0.12, 12);
  for (const side of [-1, 1]) {
    const fw = new THREE.Mesh(wg, wm);
    fw.rotation.x = Math.PI / 2;
    fw.position.set(side * 0.85, -0.06, 0.3);
    g.add(fw);
    const bw = new THREE.Mesh(wg, wm);
    bw.rotation.x = Math.PI / 2;
    bw.position.set(side * 0.85, -0.06, -0.3);
    g.add(bw);
  }
  g.position.set(0, y, z);
  g.rotation.x = THREE.MathUtils.degToRad(tiltDeg);
  parent.add(g);
  return g;
}

// yarn chain link
function chainLink(parent, x, y, z) {
  const torus = new THREE.TorusGeometry(0.08, 0.025, 8, 12);
  const m = new THREE.Mesh(torus, yarnMat(P.stitchRust));
  m.position.set(x, y, z);
  m.rotation.y = Math.PI / 2;
  parent.add(m);
}

export function create(canvas, K, AT) {
  const { r: renderer, scene, cam: camera, comp: composer, bp } = stage(canvas, {
    bg: P.skyFelt, fog: 0.025, exp: 0.82, bloom: [0.15, 0.6, 0.8]
  });
  composer.insertPass(new ShaderPass(NanGuard), 1);
  const gp = new ShaderPass(Grade); composer.addPass(gp);

  // lights — cosy FELTCRAFT
  const hemi = new THREE.HemisphereLight(P.skyFill, P.groundBounce, 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(new THREE.Color(P.keyWarm), 2.1);
  key.position.set(3.5, 5.5, 4.5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 5; key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color("#FFD2A0"), 1.2);
  rim.position.set(-3, 3, -4); scene.add(rim);
  const warm = new THREE.PointLight(new THREE.Color("#FFC98A"), 2.2, 6, 1.5);
  warm.position.set(0.6, 1.6, 2.2); scene.add(warm);

  // ---------- HISTORY (x=-40) ----------
  const hist = new THREE.Group(); hist.position.x = -40; scene.add(hist);

  // felt ground
  const hGround = new THREE.Mesh(box(20, 0.4, 12), fm(P.ground));
  hGround.position.y = -0.2; hGround.receiveShadow = true; hist.add(hGround);

  // Coney Island boardwalk (simple felt planks)
  for (let i = 0; i < 8; i++) {
    const plank = new THREE.Mesh(box(2.2, 0.12, 0.5), fm(P.spool));
    plank.position.set(-3 + i * 0.9, 0.06, 2); plank.castShadow = true; hist.add(plank);
  }

  // Reno's inclined conveyor (1896) — a felt ramp with a belt
  const ramp1 = new THREE.Group(); ramp1.position.set(-2, 0, 0); hist.add(ramp1);
  const rampBody = new THREE.Mesh(box(3.5, 0.3, 1.8), fm(P.hillMid, { flat: true }));
  rampBody.rotation.z = -0.35; rampBody.position.set(0, 1.2, 0);
  rampBody.castShadow = true; ramp1.add(rampBody);
  // belt on ramp
  const belt = new THREE.Mesh(box(3.6, 0.06, 1.5), fm(P.yarnBrown));
  belt.rotation.z = -0.35; belt.position.set(0, 1.38, 0); ramp1.add(belt);
  // support posts
  for (const xo of [-1.5, 0, 1.5]) {
    const post = new THREE.Mesh(cyl(0.08, 0.08, 2.4, 8), fm(P.yarnBrown));
    post.position.set(xo - 0.6, 0.7, -0.95); ramp1.add(post);
  }

  // Paris expo building (1900) — felt arch
  const expo = new THREE.Group(); expo.position.set(3, 0, -1); hist.add(expo);
  const arch = new THREE.Mesh(box(4, 3.5, 0.3), fm(P.skyFelt));
  arch.position.y = 1.75; expo.add(arch);
  // arch opening (darker felt)
  const opening = new THREE.Mesh(box(2.5, 2.8, 0.32), fm(P.hillFar));
  opening.position.y = 1.4; expo.add(opening);
  // "1900" label
  const labelTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = P.hudPaper; g.fillRect(0, 0, w, h);
    g.font = "bold 42px Georgia"; g.fillStyle = P.hudInk; g.textAlign = "center";
    g.fillText("1900", w / 2, 46);
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), new THREE.MeshStandardMaterial({ map: labelTex, roughness: 1 }));
  label.position.set(0, 3.6, 0.16); expo.add(label);

  // stitch lines on history ground crest
  const histStitchPts = [];
  for (let i = 0; i < 40; i++) histStitchPts.push(new THREE.Vector3(-8 + i * 0.4, 0.01, 3));
  stitchLine(histStitchPts, P.stitchCream, hist, 1, 0.15);

  // ---------- MECHANISM (x=0) ----------
  const mech = new THREE.Group(); scene.add(mech);

  // escalator body — felt housing
  const housing = new THREE.Mesh(box(10, 0.5, 2.5), fm(P.ground));
  housing.position.set(0, -0.25, 0); housing.receiveShadow = true; mech.add(housing);

  // incline section
  const incline = new THREE.Mesh(box(6, 0.4, 2.5), fm(P.hillMid, { flat: true }));
  incline.rotation.z = -0.42; incline.position.set(0, 1.8, 0);
  incline.castShadow = true; mech.add(incline);

  // felt-strip rails (two, different heights in incline)
  const railMat = fm(P.stitchRust);
  for (const side of [-1, 1]) {
    // upper rail
    const rail = new THREE.Mesh(box(8, 0.06, 0.08), railMat);
    rail.rotation.z = -0.42; rail.position.set(0, 2.05 + side * 0.15, side * 0.9);
    mech.add(rail);
    // lower rail (flat section)
    const flatRail = new THREE.Mesh(box(3, 0.06, 0.08), railMat);
    flatRail.position.set(-4, 0.15, side * 0.9); mech.add(flatRail);
    const flatRail2 = new THREE.Mesh(box(3, 0.06, 0.08), railMat);
    flatRail2.position.set(4, 3.4, side * 0.9); mech.add(flatRail2);
  }

  // steps on incline (animated by t)
  const steps = [];
  for (let i = 0; i < 12; i++) {
    const s = makeStep(mech, 0, 0, 0, mulberry(14 + i));
    steps.push(s);
  }

  // yarn chain between steps
  const chainGroup = new THREE.Group(); mech.add(chainGroup);
  for (let i = 0; i < 30; i++) {
    chainLink(chainGroup, -4 + i * 0.35, 0.02, 0);
  }

  // motor at top
  const motor = new THREE.Group(); motor.position.set(4.5, 3.2, 0); mech.add(motor);
  const motorBody = new THREE.Mesh(cyl(0.5, 0.5, 1.2, 16), fm(P.foxOrange));
  motorBody.rotation.z = Math.PI / 2; motor.add(motorBody);
  const shaft = new THREE.Mesh(cyl(0.08, 0.08, 2, 8), fm(P.yarnBrown));
  shaft.rotation.x = Math.PI / 2; motor.add(shaft);
  // gear
  const gear = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 8, 24), fm(P.buttonSun));
  gear.rotation.x = Math.PI / 2; gear.position.z = 1.1; motor.add(gear);

  // comb plate (zigzag felt)
  for (const xPos of [-4.8, 4.8]) {
    const comb = new THREE.Group(); comb.position.set(xPos, xPos > 0 ? 3.45 : 0.02, 0); mech.add(comb);
    for (let i = -4; i <= 4; i++) {
      const tooth = new THREE.Mesh(box(0.04, 0.15, 0.12), fm(P.hudInk));
      tooth.position.set(0, 0.07, i * 0.18); comb.add(tooth);
    }
    const plate = new THREE.Mesh(box(0.3, 0.05, 1.8), fm(P.spool));
    plate.position.y = -0.02; comb.add(plate);
  }

  // handrail loop
  const hrPts = [];
  for (let i = 0; i <= 20; i++) {
    const frac = i / 20;
    const x = -5 + frac * 10;
    const y = frac < 0.15 ? 0.9 : frac > 0.85 ? 4.2 : 0.9 + (frac - 0.15) / 0.7 * 3.3;
    hrPts.push(new THREE.Vector3(x, y, 1.35));
  }
  const hrCurve = new THREE.CatmullRomCurve3(hrPts);
  const hrGeo = new THREE.TubeGeometry(hrCurve, 40, 0.06, 8, false);
  const handrail = new THREE.Mesh(hrGeo, fm(P.foxDark));
  mech.add(handrail);

  // belly return path (dashed line showing steps returning underneath)
  const retPts = [];
  for (let i = 0; i <= 15; i++) {
    const frac = i / 15;
    retPts.push(new THREE.Vector3(4.5 - frac * 9, -0.6 + Math.sin(frac * Math.PI) * -0.3, 0));
  }
  const retCurve = new THREE.CatmullRomCurve3(retPts);
  const retGeo = new THREE.TubeGeometry(retCurve, 20, 0.04, 6, false);
  const retPath = new THREE.Mesh(retGeo, yarnMat(P.yarnBrown));
  mech.add(retPath);

  // AUDIRA text in 3D world (anti-reupload)
  const audiraTex = canvasTex(256, 48, (g, w, h) => {
    g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, w, h);
    g.font = "bold 28px Georgia"; g.fillStyle = P.hudInk; g.globalAlpha = 0.4;
    g.textAlign = "center"; g.fillText("AUDIRA", w / 2, 34);
  });
  const audiraPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3),
    new THREE.MeshStandardMaterial({ map: audiraTex, transparent: true, roughness: 1 }));
  audiraPlane.position.set(0, 4.2, -1.1); mech.add(audiraPlane);

  // stitch lines on mechanism housing
  const mechStitchPts = [];
  for (let i = 0; i < 30; i++) mechStitchPts.push(new THREE.Vector3(-5 + i * 0.35, 0.01, 1.3));
  stitchLine(mechStitchPts, P.stitchRust, mech, 1, 0.12);

  // ---------- ETYMOLOGY (x=40) ----------
  const etym = new THREE.Group(); etym.position.x = 40; scene.add(etym);

  // felt ground
  const eGround = new THREE.Mesh(box(14, 0.4, 10), fm(P.ground));
  eGround.position.y = -0.2; eGround.receiveShadow = true; etym.add(eGround);

  // felt signboard
  const board = new THREE.Mesh(box(5, 3, 0.25), fm(P.hudPaper));
  board.position.set(0, 2, -1); board.castShadow = true; etym.add(board);
  // border stitches on board
  const boardBorder = new THREE.Mesh(box(5.1, 3.1, 0.22), fm(P.stitchRust));
  boardBorder.position.set(0, 2, -1.02); etym.add(boardBorder);

  // "SCALA" text
  const scalaTex = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = P.hudPaper; g.fillRect(0, 0, w, h);
    g.font = "italic bold 72px Georgia"; g.fillStyle = P.scarf; g.textAlign = "center";
    g.fillText("scala", w / 2, 85);
  });
  const scalaPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75),
    new THREE.MeshStandardMaterial({ map: scalaTex, roughness: 1 }));
  scalaPlane.position.set(0, 2.8, -0.86); etym.add(scalaPlane);

  // "ESCALATOR" text
  const escTex = canvasTex(512, 96, (g, w, h) => {
    g.fillStyle = P.hudPaper; g.fillRect(0, 0, w, h);
    g.font = "bold 56px 'Courier New'"; g.fillStyle = P.hudInk; g.textAlign = "center";
    g.fillText("ESCALATOR", w / 2, 66);
  });
  const escPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.7),
    new THREE.MeshStandardMaterial({ map: escTex, roughness: 1 }));
  escPlane.position.set(0, 1.6, -0.86); etym.add(escPlane);

  // trademark stamp
  const stampTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, w, h);
    g.strokeStyle = P.hudAccent; g.lineWidth = 4;
    g.beginPath(); g.arc(w / 2, h / 2, 48, 0, Math.PI * 2); g.stroke();
    g.font = "bold 22px Georgia"; g.fillStyle = P.hudAccent; g.textAlign = "center";
    g.fillText("TM", w / 2, h / 2 + 8);
  });
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8),
    new THREE.MeshStandardMaterial({ map: stampTex, transparent: true, roughness: 1 }));
  stamp.position.set(2, 2.8, -0.85); etym.add(stamp);

  // felt hills background
  for (const [xo, yo, sc, col] of [[-5, 0.8, 2, P.hillFar], [5, 0.6, 1.8, P.hillFar], [0, 0.5, 2.5, P.hillMid]]) {
    const hill = new THREE.Mesh(sph(sc, 12, 8), fm(col));
    hill.scale.y = 0.5;
    hill.position.set(xo, yo, -4); etym.add(hill);
  }

  // button sun
  const sun = new THREE.Group(); sun.position.set(3, 5, -3); scene.add(sun);
  const sunDisc = new THREE.Mesh(cyl(0.8, 0.8, 0.15, 24),
    new THREE.MeshPhysicalMaterial({ color: P.buttonSun, roughness: 0.35, clearcoat: 0.6 }));
  sunDisc.rotation.x = Math.PI / 2; sun.add(sunDisc);
  // button holes
  for (const [dx, dy] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
    const hole = new THREE.Mesh(cyl(0.05, 0.05, 0.16, 8), new THREE.MeshStandardMaterial({ color: P.hudInk, roughness: 1 }));
    hole.rotation.x = Math.PI / 2; hole.position.set(dx, dy, 0); sun.add(hole);
  }

  // pompom clouds
  const R = mulberry(14);
  for (let i = 0; i < 5; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 3 + Math.floor(R() * 3); j++) {
      const pom = new THREE.Mesh(sph(0.25 + R() * 0.2, 10, 8), fm("#FFFFFF"));
      pom.position.set(j * 0.35 - 0.5, R() * 0.15, R() * 0.2);
      cloud.add(pom);
    }
    cloud.position.set(-15 + i * 8 + R() * 4, 5.5 + R() * 1.5, -6 - R() * 3);
    scene.add(cloud);
  }

  // notions foreground (yarn ball and spool)
  const yarnBall = new THREE.Mesh(sph(0.35, 12, 10), yarnMat(P.stitchRust));
  yarnBall.position.set(-1.8, 0.35, 4); scene.add(yarnBall);
  const spoolBody = new THREE.Mesh(cyl(0.2, 0.2, 0.5, 12), fm(P.spool));
  spoolBody.position.set(1.5, 0.25, 4.2); scene.add(spoolBody);
  const spoolThread = new THREE.Mesh(cyl(0.22, 0.22, 0.35, 12), yarnMat(P.scarf));
  spoolThread.position.set(1.5, 0.25, 4.2); scene.add(spoolThread);

  // sky backdrop
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(100, 30), fm(P.skyFelt));
  sky.position.set(0, 8, -12); scene.add(sky);

  // camera path
  const camTrack = [
    { t: 0,    pos: [-40, 3.0, 9], tgt: [-40, 1.5, 0] },
    { t: K.s2, pos: [-40, 2.5, 7], tgt: [-40, 1.2, -1] },
    { t: K.s3, pos: [-38, 2.8, 8], tgt: [-37, 1.5, -1] },
    { t: K.s4, pos: [-5, 3.0, 8],  tgt: [0, 2.0, 0] },
    { t: K.s5, pos: [0, 2.5, 7],   tgt: [0, 1.8, 0] },
    { t: K.s6, pos: [2, 3.5, 6.5], tgt: [0, 1.5, 0] },
    { t: K.s7, pos: [35, 3.0, 8],  tgt: [40, 2.0, -1] },
    { t: K.s8, pos: [40, 2.5, 6],  tgt: [40, 1.8, -1] },
    { t: K.end,pos: [40, 2.2, 5],  tgt: [40, 1.5, -1] },
  ];

  function lerpCam(t) {
    let a = camTrack[0], b = camTrack[1];
    for (let i = 1; i < camTrack.length; i++) {
      if (camTrack[i].t >= t) { b = camTrack[i]; a = camTrack[i - 1]; break; }
      a = camTrack[i]; b = camTrack[Math.min(i + 1, camTrack.length - 1)];
    }
    const f = a.t === b.t ? 1 : clamp01((t - a.t) / (b.t - a.t));
    const e = f * f * (3 - 2 * f); // smoothstep
    const mix = (arr1, arr2) => arr1.map((v, i) => v + (arr2[i] - v) * e);
    return { pos: mix(a.pos, b.pos), tgt: mix(a.tgt, b.tgt) };
  }

  // animation
  return function update(t) {
    const dur = K.dur;
    const tNorm = Math.min(t, dur);

    // camera
    const cam = lerpCam(tNorm);
    camera.position.set(...cam.pos);
    camera.lookAt(...cam.tgt);
    camera.fov = 42;
    camera.updateProjectionMatrix();

    // move key light to follow camera
    key.position.set(cam.pos[0] + 3.5, 5.5, cam.pos[1] + 4.5);
    key.target.position.set(cam.tgt[0], cam.tgt[1], cam.tgt[2]);
    warm.position.set(cam.pos[0] + 0.6, 1.6, 2.2);

    // animate escalator steps on the incline
    const chainSpeed = 0.5; // units per second
    for (let i = 0; i < steps.length; i++) {
      const phase = (i / steps.length + tNorm * chainSpeed * 0.08) % 1;
      // steps travel: flat bottom (-5,0) → incline → flat top (5,3.5) → loop back
      let sx, sy, tilt;
      if (phase < 0.1) {
        // bottom flat
        sx = -5 + phase / 0.1 * 1.5;
        sy = 0.15;
        tilt = 0;
      } else if (phase < 0.6) {
        // incline
        const ip = (phase - 0.1) / 0.5;
        sx = -3.5 + ip * 7;
        sy = 0.15 + ip * 3.3;
        tilt = -24;
      } else if (phase < 0.7) {
        // top flat
        const tp = (phase - 0.6) / 0.1;
        sx = 3.5 + tp * 1.5;
        sy = 3.45;
        tilt = 0;
      } else {
        // belly return (hidden underneath)
        const rp = (phase - 0.7) / 0.3;
        sx = 5 - rp * 10;
        sy = -0.8;
        tilt = 180;
      }
      steps[i].position.set(sx, sy, 0);
      steps[i].rotation.x = THREE.MathUtils.degToRad(tilt);
      steps[i].visible = phase < 0.7; // hide in belly
    }

    // rotate motor gear
    gear.rotation.z = tNorm * 1.5;
    shaft.rotation.z = tNorm * 1.5;

    // animate chain group y oscillation
    chainGroup.position.y = Math.sin(tNorm * 2) * 0.02;

    // sun gentle bob
    sun.position.y = 5 + Math.sin(tNorm * 0.4) * 0.15;

    // clouds drift
    scene.children.forEach(c => {
      if (c.isGroup && c.children.length > 0 && c.children[0].geometry?.type === "SphereGeometry" && c.position.y > 4) {
        c.position.x += 0.002;
      }
    });

    // grade flash on scene transitions
    let flash = 0;
    for (const sk of ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]) {
      const d = Math.abs(tNorm - K[sk]);
      if (d < 0.25) flash = Math.max(flash, (1 - d / 0.25) * 0.12);
    }
    gp.uniforms.flash.value = flash;

    composer.render();
  };
}
