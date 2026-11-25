// EP26 TABUNG PITOT. INFLATABLE: puffy vinyl toys, glossy saturated, rounded geometry, visible seams.
// Stations: airplane (center), Henri+river (right), cutaway tube (front-left), gauge+heater (back-left),
// wasp+nest (behind). Camera orbits visiting each station synced to VO.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { track, stage, pts, canvasTex, mulberry, clamp01, ramp, box, cyl, std } from "./lib3d.js";
import { NanGuard, gradePass, stripEnv, textPlane, person, pose, flashAt } from "./kit3d.js";

export function create(canvas, K, AT) {
  const rng = mulberry(2026026);
  const { r, scene, cam, comp } = stage(canvas, {
    bg: "#87DEFF", fog: 0.006, exp: 1.15, bloom: [0.35, 0.5, 0.88], fov: 38, shadow: true
  });
  comp.passes.splice(1, 0, new ShaderPass(NanGuard));
  const grade = gradePass({ shadow: [0.05, 0.02, 0.12], high: [1.02, 0.98, 0.95], sat: 1.12, con: 1.04, flashColor: [1, 0.85, 0.5] });
  comp.addPass(grade);
  stripEnv(r, scene, [
    [12, 8, "#ffffff", 3, 0, 6, -8], [8, 5, "#FFD93D", 2, -6, 4, 5],
    [10, 6, "#FF4F8A", 1.5, 6, 3, 4], [6, 4, "#4ECBF7", 2, 0, 8, 6],
  ], "#87DEFF", 0.5);
  const vinyl = (c, rough = 0.22) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.05 });
  const PINK = "#FF4F8A", YEL = "#FFD93D", GRN = "#6BCB77", ORG = "#FF8B3D", BLU = "#4ECBF7";
  const WHT = "#FAFAFA", RED = "#E63946", SEAM = "#2A3A5A";

  // ---- lighting ----
  scene.add(new THREE.AmbientLight("#c8e8ff", 0.6));
  const key = new THREE.DirectionalLight("#fff5e6", 1.8);
  key.position.set(4, 8, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const sc = key.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14;
  scene.add(key);
  scene.add(new THREE.DirectionalLight("#FFD93D", 0.5).translateX(-3).translateY(5).translateZ(-4));

  // ---- floor: puffy cloud disc ----
  const fl = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), vinyl("#e0f4ff", 0.4));
  fl.position.y = -1.5; fl.scale.y = 0.12; fl.receiveShadow = true; scene.add(fl);

  // ---- AIRPLANE (origin, nose → +Z) ----
  const plane = new THREE.Group(); scene.add(plane);
  const fuse = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), vinyl(WHT));
  fuse.scale.set(1, 0.9, 3.5); fuse.castShadow = true; plane.add(fuse);
  const noseCone = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), vinyl("#E8E8E8"));
  noseCone.scale.set(0.85, 0.78, 0.6); noseCone.position.z = 3.2; noseCone.castShadow = true; plane.add(noseCone);
  for (let i = 0; i < 2; i++) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), vinyl(BLU, 0.1));
    w.scale.set(1.4, 0.8, 0.5); w.position.set((i - 0.5) * 0.35, 0.55, 2.6); plane.add(w);
  }
  for (const s of [-1, 1]) {
    const wg = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), vinyl(WHT));
    wg.scale.set(2.5, 0.15, 0.8); wg.position.set(s * 2.2, -0.1, -0.5); wg.castShadow = true; plane.add(wg);
    const eng = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.6, 8, 12), vinyl("#DDD"));
    eng.rotation.x = Math.PI / 2; eng.position.set(s * 1.8, -0.4, 0.2); eng.castShadow = true; plane.add(eng);
  }
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), vinyl(PINK));
  tail.scale.set(0.12, 1.2, 0.6); tail.position.set(0, 0.9, -3.2); plane.add(tail);
  // fuselage seams
  for (let i = -2; i <= 2; i++) {
    const sr = new THREE.Mesh(new THREE.TorusGeometry(0.88 - Math.abs(i) * 0.1, 0.008, 6, 32), std(SEAM, 0.8));
    sr.rotation.x = Math.PI / 2; sr.position.z = i * 0.8; sr.scale.y = 0.9; plane.add(sr);
  }

  // ---- PITOT TUBES ×3 ----
  const pitots = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const bd = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 6, 10), vinyl(ORG));
    bd.rotation.x = Math.PI / 2; g.add(bd);
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), vinyl(RED)).translateZ(0.3));
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 6, 16), std(SEAM, 0.8)).translateZ(0.05));
    g.position.set(-0.2 + i * 0.2, -0.15 + (i === 1 ? 0.08 : 0), 3.6);
    plane.add(g); pitots.push(g);
  }

  // ---- PITOT COVER (s8) ----
  const coverMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 12), vinyl(RED));
  coverMesh.rotation.x = -Math.PI / 2; coverMesh.visible = false;
  coverMesh.position.set(0, -0.07, 4.05); plane.add(coverMesh);
  const ribbonMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.01), vinyl(RED, 0.4));
  ribbonMesh.visible = false; ribbonMesh.position.set(0, -0.35, 4.05); plane.add(ribbonMesh);

  // ---- STATIC PORTS (s5, left fuselage) ----
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), std("#333", 0.3));
    p.position.set(-0.98, 0.1 + i * 0.12, 1.5 - i * 0.3); p.rotation.y = -Math.PI / 2; plane.add(p);
  }
  const statLabel = textPlane(256, 80, [["LUBANG STATIS", "bold 32px Arial", BLU, 0.5]], 0.7, { bg: "rgba(0,0,0,0.75)" });
  statLabel.position.set(-1.4, 0.6, 1.0); statLabel.rotation.y = -0.4; statLabel.visible = false; scene.add(statLabel);

  // ---- HENRI PITOT + RIVER (s2, right-front) ----
  const henriGrp = new THREE.Group(); henriGrp.position.set(7, 0, 5); henriGrp.rotation.y = -Math.PI / 3; scene.add(henriGrp);
  const river = new THREE.Mesh(new THREE.TorusGeometry(3, 0.5, 12, 32, Math.PI * 0.8), vinyl("#2196F3", 0.15));
  river.rotation.x = Math.PI / 2; river.position.y = -0.5; river.scale.y = 0.3; henriGrp.add(river);
  const brdg = box(1.2, 0.15, 0.6, vinyl("#8D6E63", 0.5), 0, 0.3, 0, henriGrp);
  for (const s of [-0.4, 0.4]) cyl(0.08, 0.08, 0.8, 8, vinyl("#8D6E63", 0.5), s, -0.1, 0, henriGrp);
  const henri = person({ skin: "#c99a78", top: "#3E5F8A", bottom: "#2C2C3A", hair: "#4A3728" });
  henri.G.scale.setScalar(0.45); henri.G.position.set(0, 0.38, 0); henriGrp.add(henri.G);
  pose(henri, { aL: 0.8, aR: 0.3, eL: 0.8, eR: 0.5 });
  const mTube = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.25, 4, 8), vinyl(ORG));
  mTube.rotation.x = 0.6; mTube.position.set(-0.14, 0.3, 0.12); henri.G.add(mTube);
  const yearSign = textPlane(256, 96, [["1732", "bold 60px Arial", YEL, 0.5]], 0.6, { bg: "rgba(42,58,90,0.85)" });
  yearSign.position.set(0.8, 1.0, 0); henriGrp.add(yearSign);

  // ---- CUTAWAY TUBE (s4, front-left) ----
  const cut = new THREE.Group(); cut.position.set(-6, 1.2, 7); cut.rotation.y = Math.PI / 4; scene.add(cut);
  const tubeWall = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3, 16, 1, true, 0, Math.PI), vinyl(ORG, 0.3));
  tubeWall.material.side = THREE.DoubleSide; tubeWall.rotation.z = Math.PI / 2; cut.add(tubeWall);
  const chm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.5, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: "#FFE0B2", roughness: 0.5, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
  chm.rotation.z = Math.PI / 2; cut.add(chm);
  cut.add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 24), vinyl(RED)).translateX(1.5).rotateY(Math.PI / 2));
  cut.add(new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), vinyl(ORG)).translateX(-1.3).rotateY(-Math.PI / 2));
  const pressLbl = textPlane(300, 80, [["TEKANAN TOTAL", "bold 36px Arial", "#FFF", 0.5]], 0.9, { bg: "rgba(230,57,70,0.9)" });
  pressLbl.position.set(0, 1.1, 0); pressLbl.visible = false; cut.add(pressLbl);

  // ---- AIR PARTICLES (cutaway, s4) ----
  const airP = pts(scene, 50, { color: 0xFFD93D, size: 0.15, add: false, opacity: 0.8 });
  airP.P.visible = false;

  // ---- SPEEDOMETER + HEATER (s6, back-left) ----
  const gaugeGrp = new THREE.Group(); gaugeGrp.position.set(-5, 2, -3); gaugeGrp.rotation.y = 0.5; scene.add(gaugeGrp);
  const dialTex = canvasTex(512, 512, (g) => {
    g.fillStyle = "#1a1a2e"; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#fff"; g.font = "bold 36px Arial"; g.textAlign = "center";
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
      g.fillText(String(i * 50), 256 + Math.cos(a) * 195, 256 + Math.sin(a) * 195 + 12);
      g.beginPath(); g.moveTo(256 + Math.cos(a) * 218, 256 + Math.sin(a) * 218);
      g.lineTo(256 + Math.cos(a) * 240, 256 + Math.sin(a) * 240);
      g.strokeStyle = i % 5 === 0 ? "#FFD93D" : "#666"; g.lineWidth = i % 5 === 0 ? 4 : 2; g.stroke();
    }
    g.fillStyle = "#FFD93D"; g.font = "bold 28px Arial"; g.fillText("km/h", 256, 340);
  });
  gaugeGrp.add(new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ map: dialTex })));
  const needlePiv = new THREE.Group(); gaugeGrp.add(needlePiv);
  const ndl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.02), std(RED, 0.3)); ndl.position.y = 0.35; needlePiv.add(ndl);
  gaugeGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: "#fff", roughness: 0.05, transparent: true, opacity: 0.15 })).rotateX(Math.PI));
  gaugeGrp.visible = false;

  const heatGrp = new THREE.Group(); heatGrp.position.set(-5, 0.5, -2); scene.add(heatGrp);
  heatGrp.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.2, 6, 12), vinyl(ORG)).rotateZ(Math.PI / 2));
  const coilMat = new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4, metalness: 0.3 });
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 16), coilMat);
    c.position.x = -0.45 + i * 0.12; c.rotation.y = Math.PI / 2; heatGrp.add(c);
  }
  heatGrp.visible = false;

  // ice crystals
  const ices = [];
  for (let i = 0; i < 5; i++) {
    const ic = new THREE.Mesh(new THREE.OctahedronGeometry(0.06 + rng() * 0.04, 0),
      new THREE.MeshStandardMaterial({ color: "#b3e5fc", roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.7 }));
    ic.position.set(1 + i * 0.2, (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.3);
    heatGrp.add(ic); ices.push({ m: ic, bx: ic.position.x });
  }

  // ---- WASP + NEST (s7, behind) ----
  const waspGrp = new THREE.Group(); waspGrp.position.set(3, 1.5, -6); waspGrp.visible = false; scene.add(waspGrp);
  const wBody = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), vinyl(YEL));
  wBody.scale.z = 1.4; waspGrp.add(wBody);
  for (let i = -1; i <= 1; i++) waspGrp.add(new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 6, 24), std("#1a1a1a", 0.4)).translateZ(i * 0.15));
  waspGrp.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), vinyl("#1a1a1a")).translateZ(0.55));
  for (const s of [-1, 1]) {
    waspGrp.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), vinyl(WHT, 0.1)).translateX(s * 0.1).translateY(0.08).translateZ(0.7));
    waspGrp.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), std("#000")).translateX(s * 0.1).translateY(0.08).translateZ(0.74));
    const wng = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12),
      new THREE.MeshStandardMaterial({ color: "#e0f7fa", roughness: 0.05, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    wng.position.set(s * 0.25, 0.3, 0); wng.rotation.set(0.3, s * 0.4, 0); waspGrp.add(wng);
  }
  waspGrp.add(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 6), vinyl("#1a1a1a")).rotateX(Math.PI / 2).translateY(0.55));

  const nestGrp = new THREE.Group(); nestGrp.position.set(3, 0.5, -4.5); nestGrp.visible = false; scene.add(nestGrp);
  nestGrp.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.8, 6, 12), vinyl(ORG)).rotateZ(Math.PI / 2));
  for (let i = 0; i < 4; i++) {
    const cl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), vinyl("#B8860B", 0.6));
    cl.position.set(0.5 + rng() * 0.15, (rng() - 0.5) * 0.1, (rng() - 0.5) * 0.1);
    cl.rotation.z = Math.PI / 2; nestGrp.add(cl);
  }

  // crash plane (small, tilted, background)
  const crashGrp = new THREE.Group(); crashGrp.position.set(6, -0.5, -8);
  crashGrp.rotation.set(0.3, 0.5, 0.6); crashGrp.scale.setScalar(0.3); crashGrp.visible = false; scene.add(crashGrp);
  const cf = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), vinyl("#ccc", 0.5));
  cf.scale.set(1, 0.9, 3); crashGrp.add(cf);
  for (const s of [-1, 1]) {
    const cw = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), vinyl("#ccc", 0.5));
    cw.scale.set(2, 0.1, 0.6); cw.position.x = s * 1.5; crashGrp.add(cw);
  }

  // ---- AUDIRA 3D sign ----
  const audSign = textPlane(512, 128, [["AUDIRA", "bold 80px Arial", PINK, 0.5]], 1.2, { bg: "rgba(255,255,255,0.92)", border: PINK });
  audSign.position.set(0, 2.8, -2.5); audSign.visible = false; scene.add(audSign);

  // ---- WIND PARTICLES ----
  const wind = pts(scene, 40, { color: 0xffffff, size: 0.1, add: true, opacity: 0.45 });

  // ---- CAMERA ---- [t, cx, cy, cz, lx, ly, lz]
  const camT = track([
    [0,                 3, 3, 10,       0, 0.5, 3],
    [K.s1 + 1,          2, 2, 8,        0, 0, 3.2],
    [AT["s1:tabung"],   0.8, 1, 5.5,    0, -0.1, 3.6],
    [AT["s1:angin"],    1.5, 1.8, 6,    0, 0.3, 3.2],
    [K.s2,              5, 2.5, 8,      7, 0.5, 5],
    [AT["s2:Henri"],    7.5, 1.8, 6,    7, 0.5, 5],
    [AT["s2:mengukur"], 8, 1, 4.5,      7, 0, 5],
    [AT["s2:Seine"],    6.5, 0.8, 6.5,  7, -0.3, 5],
    [K.s3,              -1.5, 2.5, 8,   0, 0.5, 2.5],
    [AT["s3:tiga"],     -0.5, 1.2, 6,   0, 0, 3.3],
    [AT["s3:kokpit"],   0.3, 1.8, 5.5,  0, 0.5, 2.8],
    [K.s4,              -3.5, 2.5, 9,   -6, 1.2, 7],
    [AT["s4:masuk"],    -5.5, 1.8, 6,   -6, 1.2, 7],
    [AT["s4:terhenti"], -6, 1.5, 5.5,   -6, 1.2, 7],
    [AT["s4:tekanan"],  -5.5, 2, 5,     -6, 1.5, 7],
    [K.s5,              -3, 1.8, 5,     -1, 0.2, 1.5],
    [AT["s5:statis"],   -2.5, 1, 4,     -1, 0.1, 1.5],
    [AT["s5:tekanan"],  -2, 1.3, 5,     -0.8, 0.3, 1],
    [K.s6,              -4, 3, 1,       -5, 2, -3],
    [AT["s6:kecepatan"],-4.8, 2.5, -0.5,-5, 2, -3],
    [AT["s6:empat"],    -5, 2.2, -1,    -5, 2, -3],
    [AT["s6:pemanas"],  -4.5, 1.2, 0,   -5, 0.5, -2],
    [AT["s6:es"],       -4, 0.8, -0.5,  -5, 0.5, -2],
    [K.s7,              3, 2.5, -3,     3, 1.5, -6],
    [AT["s7:tawon"],    3.5, 2, -4.5,   3, 1.5, -6],
    [AT["s7:Boeing"],   4.5, 2.5, -5,   5, 0, -7],
    [AT["s7:jatuh"],    5, 1.5, -6,     6, -0.5, -8],
    [AT["s7:Brisbane"], 3.5, 1.5, -3,   3, 0.5, -4.5],
    [AT["s7:tercatat"], 3.8, 1.8, -3.5, 3, 0.8, -5],
    [K.s8,              2, 2.5, 7,      0, 0.5, 3.5],
    [AT["s8:ditutup"],  0.8, 1.2, 5.5,  0, 0, 3.8],
    [AT["s8:AUDIRA"],   0.5, 3, 1.5,    0, 2.8, -2.5],
    [AT["s8:Episode"],  2.5, 3.5, 5,    0, 1.5, 0],
    [K.outro,           0, 3.5, 0,      0, 1, 0],
    [K.end,             0, 4.5, -3,     0, 1, 0],
  ]);

  // ---- RENDER ----
  return (t) => {
    const [cx, cy, cz, lx, ly, lz] = camT(t);
    cam.position.set(cx, cy, cz); cam.lookAt(lx, ly, lz);

    // airplane hover
    plane.position.y = Math.sin(t * 0.8) * 0.06;
    plane.rotation.z = Math.sin(t * 0.5) * 0.012;

    // Henri bob
    henri.G.position.y = 0.38 + Math.sin(t * 2) * 0.02;
    pose(henri, { aL: 0.8 + Math.sin(t * 1.5) * 0.1, aR: 0.3 + Math.sin(t * 1.2) * 0.08, eL: 0.8, eR: 0.5 });

    // cutaway air particles (s4)
    const s4On = ramp(t, K.s4, K.s4 + 0.5);
    const s4Off = 1 - ramp(t, K.s5 - 0.5, K.s5);
    const s4V = s4On * s4Off;
    const airEnter = ramp(t, AT["s4:masuk"], AT["s4:terhenti"] + 1);
    airP.P.visible = s4V > 0.01;
    if (airP.P.visible) {
      for (let i = 0; i < 50; i++) {
        const sd = mulberry(i * 73 + 1732)();
        const pr = clamp01(airEnter * 3 - sd * 2);
        airP.pos[i * 3]     = -6 + 1.8 - pr * 2.5 * (0.5 + 0.5 * sd);
        airP.pos[i * 3 + 1] = 1.2 + (sd - 0.5) * 0.4 * (1 - pr * 0.5);
        airP.pos[i * 3 + 2] = 7 + (mulberry(i * 37)() - 0.5) * 0.4 * (1 - pr * 0.5);
      }
      airP.commit();
    }
    pressLbl.visible = ramp(t, AT["s4:tekanan"] - 0.3, AT["s4:tekanan"]) > 0.01;

    // static port label (s5)
    const s5V = ramp(t, AT["s5:statis"], AT["s5:statis"] + 0.5) * (1 - ramp(t, K.s6 - 0.3, K.s6));
    statLabel.visible = s5V > 0.01;
    if (statLabel.visible) statLabel.material.opacity = s5V;

    // gauge (s6)
    const g6On = ramp(t, K.s6 - 0.5, K.s6);
    const g6Off = 1 - ramp(t, K.s7 - 0.5, K.s7);
    gaugeGrp.visible = g6On * g6Off > 0.01;
    heatGrp.visible = gaugeGrp.visible;
    const spd = ramp(t, K.s6, AT["s6:empat"] || K.s6e);
    const boost = ramp(t, AT["s6:empat"], AT["s6:empat"] + 1);
    needlePiv.rotation.z = -Math.PI * 0.75 + (spd + boost * 0.4) * Math.PI * 1.2;
    // heater glow
    const hGlow = ramp(t, AT["s6:pemanas"], AT["s6:pemanas"] + 0.8);
    coilMat.emissive.setHex(0xff3300); coilMat.emissiveIntensity = hGlow * 0.8;
    // ice approach + melt
    const iT = ramp(t, AT["s6:es"] - 0.3, AT["s6:es"] + 1.5);
    for (let i = 0; i < ices.length; i++) {
      const pr = clamp01(iT * 2 - i * 0.15);
      ices[i].m.position.x = ices[i].bx - pr * 1.5;
      ices[i].m.scale.setScalar(Math.max(0.01, 1 - clamp01(pr - 0.6) * 2.5));
    }

    // wasp (s7)
    const w7 = ramp(t, K.s7 - 0.3, K.s7 + 0.5) * (1 - ramp(t, K.s8 - 0.3, K.s8));
    waspGrp.visible = w7 > 0.01; nestGrp.visible = w7 > 0.01; crashGrp.visible = w7 > 0.01;
    if (waspGrp.visible) {
      waspGrp.position.y = 1.5 + Math.sin(t * 3) * 0.15;
      waspGrp.rotation.y = Math.sin(t * 1.5) * 0.3;
    }

    // pitot cover (s8)
    const covP = ramp(t, AT["s8:ditutup"] - 0.3, AT["s8:ditutup"] + 0.3);
    coverMesh.visible = covP > 0.01; ribbonMesh.visible = covP > 0.01;
    if (coverMesh.visible) {
      coverMesh.position.z = 4.05 + (1 - covP) * 0.5;
      ribbonMesh.position.z = coverMesh.position.z;
      ribbonMesh.rotation.z = Math.sin(t * 2) * 0.1;
    }

    // AUDIRA sign
    const aV = ramp(t, AT["s8:AUDIRA"] - 0.3, AT["s8:AUDIRA"] + 0.3) * (1 - ramp(t, K.outro - 0.3, K.outro));
    audSign.visible = aV > 0.01;
    if (audSign.visible) { audSign.material.opacity = aV; audSign.position.y = 2.8 + Math.sin(t * 1.2) * 0.1; }

    // wind particles (always)
    for (let i = 0; i < 40; i++) {
      const sd = mulberry(i * 53 + 999)();
      const cy2 = ((t * 2 + sd * 20) % 20) - 10;
      wind.pos[i * 3] = (sd - 0.5) * 14;
      wind.pos[i * 3 + 1] = sd * 4 + Math.sin(t + sd * 6) * 0.3;
      wind.pos[i * 3 + 2] = cy2;
    }
    wind.commit();

    // flash on cuts
    grade.uniforms.flash.value = flashAt(t, [K.s2, K.s3, K.s4, K.s5, K.s6, K.s7, K.s8], 0.15);

    comp.render();
  };
}
