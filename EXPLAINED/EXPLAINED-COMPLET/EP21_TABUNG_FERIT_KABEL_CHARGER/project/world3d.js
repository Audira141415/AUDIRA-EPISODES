// EP21 TABUNG FERIT (CIRCUITFORGE): one glossy dark-green circuit board as the whole world, lit like a macro product
// studio (warm key, cyan rim, strip-light reflections on copper and gold).
//   MAIN  x=-3..9  generic charger brick (lid lifts on its switching board), a black cable with the ferrite bead, a phone,
//                  a small radio that picks up the interference. Waves, noise spikes and a square-wave scope live here.
//   LAB   x=30     a giant ferrite ring cut in half on the board: element orbs (Fe, Ni, Zn, Mn) fly in, two wires run
//                  through it, opposite fields cancel, common-mode noise stacks inside the ring and leaves as heat.
//   TOKYO x=60     a 1930 lab plinth with two generic figures and name plates, a small factory block rises for 1935.
// Generic products only. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";
import { NanGuard, gradePass, stripEnv, textPlane, person, pose, flashAt } from "./kit3d.js";

const C = { mask: "#0c2a21", maskL: "#14402f", copper: "#c87533", gold: "#d9ae4f", die: "#3a3f4a", amber: "#ffb547", cyan: "#39d5ff",
  magenta: "#ff5fa8", ink: "#071410", plastic: "#16181b", ferrite: "#3b3d40", white: "#e9efe9", heat: "#ff6a2a" };
const MONO = "'Courier New', monospace", SANS = "'Arial Black', Arial, sans-serif";
const LX = 30, TX = 60;

function boardTex() {
  const R = mulberry(2121);
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = C.mask; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.012 + R() * 0.02})`; g.fillRect(R() * w, R() * h, 2, 2); }
    g.lineCap = "round"; g.lineJoin = "round";
    for (let i = 0; i < 70; i++) {
      let x = Math.round(R() * 32) * 32, y = Math.round(R() * 32) * 32;
      g.strokeStyle = R() < 0.8 ? "rgba(200,117,51,.55)" : "rgba(217,174,79,.6)"; g.lineWidth = R() < 0.7 ? 5 : 10;
      g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 4; s++) { const d = (R() * 4) | 0, L = 32 * (2 + ((R() * 6) | 0)); if (d === 0) x += L; else if (d === 1) y += L; else if (d === 2) { x += L * 0.7; y += L * 0.7; } else y -= L; g.lineTo(x, y); }
      g.stroke(); g.fillStyle = "#d9ae4f"; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
    }
    g.fillStyle = "rgba(233,239,233,.35)"; g.font = `700 22px ${MONO}`;
    for (let i = 0; i < 14; i++) g.fillText(["R12", "C7", "L3", "U1", "FB1", "D4", "Q2"][i % 7], R() * w, R() * h);
  }, [14, 6]);
}

// Half annulus extruded along x. a0 = -PI/2 gives the back half (z<0), PI/2 the front half.
function halfRing(rIn, rOut, len, a0, full = false) {
  const s = new THREE.Shape();
  if (full) { s.absarc(0, 0, rOut, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absarc(0, 0, rIn, 0, Math.PI * 2, true); s.holes.push(hole); }
  else { s.absarc(0, 0, rOut, a0, a0 + Math.PI, false); s.absarc(0, 0, rIn, a0 + Math.PI, a0, true); }
  const b = Math.min(0.05, (rOut - rIn) * 0.2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 2, curveSegments: 56 });
  geo.translate(0, 0, -len / 2); geo.rotateY(Math.PI / 2);
  return geo;
}
function rbox(w, h, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelSize: r * 0.6, bevelThickness: r * 0.6, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -(d - 2 * r * 0.6) / 2);
  return geo;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x06110d, fog: 0.018, exp: 1.0, bloom: [0.55, 0.5, 0.82] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const grade = gradePass({ shadow: [0.1, 0.6, 0.65], high: [1.06, 0.98, 0.9], sat: 1.08, con: 1.08, flashColor: [0.75, 0.95, 1.0] });
  comp.addPass(grade);
  stripEnv(r, scene, [[8, 2, 0xffe2c0, 2.2, -4, 6, 4], [2, 8, 0xbfefff, 1.4, 6, 3, -3], [10, 1.5, 0xffffff, 1.0, 0, -4, 2]], 0x0a1512, 0.58);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

  // lights
  scene.add(new THREE.HemisphereLight(0xbfe9ff, 0x0b1a14, 0.45));
  const key = new THREE.DirectionalLight(0xffe0bd, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 50 }); key.shadow.bias = -0.0004;
  const rim = new THREE.DirectionalLight(0x6fdcff, 2.0), fill = new THREE.PointLight(0xffb36b, 18, 14, 2);
  scene.add(key, key.target, rim, rim.target, fill);

  // board
  const board = new THREE.Mesh(new THREE.PlaneGeometry(140, 60), new THREE.MeshPhysicalMaterial({ map: boardTex(), roughness: 0.38, metalness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.25 }));
  board.rotation.x = -Math.PI / 2; board.position.x = 30; board.receiveShadow = true; scene.add(board);
  const M = {
    plastic: new THREE.MeshPhysicalMaterial({ color: C.plastic, roughness: 0.32, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#121315", roughness: 0.55 }),
    ferrite: new THREE.MeshStandardMaterial({ color: C.ferrite, roughness: 0.62, metalness: 0.35, emissive: new THREE.Color(C.heat), emissiveIntensity: 0 }),
    copper: new THREE.MeshStandardMaterial({ color: C.copper, roughness: 0.28, metalness: 0.95 }),
    gold: new THREE.MeshStandardMaterial({ color: C.gold, roughness: 0.22, metalness: 1.0 }),
    die: new THREE.MeshStandardMaterial({ color: "#1b1d22", roughness: 0.3, metalness: 0.4 }),
    pcb: new THREE.MeshStandardMaterial({ color: C.maskL, roughness: 0.4, metalness: 0.1 }),
  };
  // ferrite grain sparkle
  M.ferrite.roughnessMap = canvasTex(256, 256, (g, w, h) => { const R = mulberry(5); g.fillStyle = "#9a9a9a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { const v = (R() * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 2, 2); } }, [3, 3]);

  // ---------------- MAIN ----------------
  const MAIN = new THREE.Group(); scene.add(MAIN);
  // charger brick: base + lid, AUDIRA print on the lid
  const CH = new THREE.Group(); CH.position.set(-3, 0, 0); MAIN.add(CH);
  const base = new THREE.Mesh(rbox(2.2, 0.7, 3.0, 0.14), M.plastic); base.position.y = 0.35; base.castShadow = base.receiveShadow = true; CH.add(base);
  const lid = new THREE.Group(); lid.position.set(-1.1, 0.7, 0); CH.add(lid);
  const lidM = new THREE.Mesh(rbox(2.2, 0.6, 3.0, 0.14), M.plastic); lidM.position.set(1.1, 0.3, 0); lidM.castShadow = true; lid.add(lidM);
  const lab = textPlane(512, 384, [["AUDIRA", `900 92px ${SANS}`, "#e9efe9", 0.3], ["INPUT 100-240V ~", `700 34px ${MONO}`, "#9fb3aa", 0.6], ["OUTPUT 5V 2A", `700 34px ${MONO}`, "#9fb3aa", 0.76]], 1.6);
  lab.rotation.x = -Math.PI / 2; lab.position.set(1.1, 0.612, 0); lid.add(lab);
  // switching board inside the brick
  const SW = new THREE.Group(); SW.position.y = 0.72; CH.add(SW);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 2.6), M.pcb); SW.add(pcb);
  const xf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), M.die); xf.position.set(-0.35, 0.27, -0.5); SW.add(xf);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 12, 32), M.copper); coil.rotation.x = Math.PI / 2; coil.position.set(-0.35, 0.3, -0.5); SW.add(coil);
  for (let i = 0; i < 3; i++) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.55, 20), new THREE.MeshStandardMaterial({ color: "#2b4f8f", roughness: 0.35, metalness: 0.3 })); cap.position.set(0.45, 0.3, -0.85 + i * 0.4); cap.castShadow = true; SW.add(cap); }
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), M.die); chip.position.set(0.1, 0.08, 0.6); SW.add(chip);
  for (let i = 0; i < 8; i++) { const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.14), M.gold); pin.position.set(-0.12 + (i % 4) * 0.08, 0.04, 0.6 + (i < 4 ? -0.3 : 0.3)); SW.add(pin); }
  const chipGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, toneMapped: false })); chipGlow.rotation.x = -Math.PI / 2; chipGlow.position.set(0.1, 0.135, 0.6); SW.add(chipGlow);
  // square-wave scope floating over the brick
  const SC = new THREE.Group(); SC.position.set(-3, 2.55, 0.2); MAIN.add(SC);
  const scBg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), new THREE.MeshBasicMaterial({ color: "#04110d", transparent: true, opacity: 0.85 })); SC.add(scBg);
  const scEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.6, 1.1)), new THREE.LineBasicMaterial({ color: C.cyan, transparent: true })); SC.add(scEdge);
  const NW = 220, wavePos = new Float32Array(NW * 3), waveG = new THREE.BufferGeometry(); waveG.setAttribute("position", new THREE.BufferAttribute(wavePos, 3));
  const wave = new THREE.Line(waveG, new THREE.LineBasicMaterial({ color: C.cyan, transparent: true, toneMapped: false })); wave.frustumCulled = false; SC.add(wave);
  const scLab = textPlane(512, 64, [["SAKLAR: NYALA / MATI", `700 34px ${MONO}`, C.cyan, 0.5]], 1.6); scLab.position.set(0, 0.72, 0.01); SC.add(scLab);

  // cable: charger -> ferrite bead -> phone
  const BX = 0.6, BY = 0.36;
  const path = new THREE.CatmullRomCurve3([[-1.85, 0.3, 0.2], [-1.2, 0.3, 0.2], [-0.3, BY, 0], [BX - 0.6, BY, 0], [BX + 0.6, BY, 0], [1.9, 0.3, 0.1], [3.5, 0.12, 0.9], [5.6, 0.12, 0.4], [7.2, 0.12, 0.2], [7.9, 0.12, 0.2]].map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const cable = new THREE.Mesh(new THREE.TubeGeometry(path, 260, 0.1, 14), M.rubber); cable.castShadow = true; MAIN.add(cable);
  const plug = new THREE.Mesh(rbox(0.5, 0.18, 0.28, 0.06), M.plastic); plug.rotation.y = Math.PI / 2; plug.position.set(8.1, 0.12, 0.2); MAIN.add(plug);
  // phone
  const ph = new THREE.Mesh(rbox(1.7, 3.3, 0.22, 0.08), new THREE.MeshPhysicalMaterial({ color: "#1d2026", roughness: 0.25, metalness: 0.6, clearcoat: 1 }));
  ph.rotation.x = -Math.PI / 2; ph.position.set(9.4, 0.11, 0.3); ph.castShadow = true; MAIN.add(ph);
  const scr = textPlane(340, 660, [["AUDIRA", `900 54px ${SANS}`, "#e9efe9", 0.36], ["⚡ 64%", `700 60px ${MONO}`, C.cyan, 0.52]], 1.5, { bg: "#0b2a33" });
  scr.rotation.x = -Math.PI / 2; scr.position.set(9.4, 0.235, 0.3); MAIN.add(scr);
  // ferrite bead: clamshell (front/back halves) around a solid ferrite ring
  const BD = new THREE.Group(); BD.position.set(BX, BY, 0); MAIN.add(BD);
  const ringS = new THREE.Mesh(halfRing(0.11, 0.27, 0.8, 0, true), M.ferrite); ringS.castShadow = true; BD.add(ringS);
  const shB = new THREE.Mesh(halfRing(0.3, 0.37, 1.0, -Math.PI / 2), M.plastic), shF = new THREE.Mesh(halfRing(0.3, 0.37, 1.0, Math.PI / 2), M.plastic);
  shB.castShadow = shF.castShadow = true; BD.add(shB, shF);
  // radio that catches the interference
  const RD = new THREE.Group(); RD.position.set(4.6, 0, -3.0); RD.rotation.y = -0.35; MAIN.add(RD);
  const rdB = new THREE.Mesh(rbox(2.1, 1.25, 0.9, 0.12), new THREE.MeshStandardMaterial({ color: "#b8452f", roughness: 0.45 })); rdB.position.y = 0.63; rdB.castShadow = true; RD.add(rdB);
  const grill = new THREE.Mesh(new THREE.CircleGeometry(0.38, 32), new THREE.MeshStandardMaterial({ color: "#2a1a16", roughness: 0.8 })); grill.position.set(-0.45, 0.63, 0.46); RD.add(grill);
  const statT = [0, 1, 2].map((k) => canvasTex(128, 64, (g, w, h) => { const R = mulberry(77 + k); for (let i = 0; i < 1400; i++) { const v = (R() * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * w, R() * h, 3, 3); } }));
  const rdS = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), new THREE.MeshBasicMaterial({ color: "#7fe9c9", toneMapped: false })); rdS.position.set(0.45, 0.75, 0.46); RD.add(rdS);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6), M.gold); ant.position.set(0.8, 1.9, 0); ant.rotation.z = -0.3; RD.add(ant);
  // radiated / received waves around the cable
  const ringMat = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const WAV = [];
  for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 64), ringMat(C.cyan)); m.frustumCulled = false; MAIN.add(m); WAV.push(m); }
  const pathPt = new THREE.Vector3(), pathTan = new THREE.Vector3();
  // noise spikes riding the cable
  const noise = pts(scene, 60, { color: C.amber, size: 0.32 });
  const curr = pts(scene, 40, { color: C.cyan, size: 0.2 });

  // ---------------- LAB ----------------
  const LAB = new THREE.Group(); LAB.position.set(LX, 0, 0); scene.add(LAB);
  const RC = 2.4;
  const bigB = new THREE.Mesh(halfRing(1.0, 2.2, 2.2, -Math.PI / 2), M.ferrite), bigF = new THREE.Mesh(halfRing(1.0, 2.2, 2.2, Math.PI / 2), M.ferrite.clone());
  bigF.material.transparent = true; bigB.position.y = bigF.position.y = RC; bigB.castShadow = bigF.castShadow = true; LAB.add(bigB, bigF);
  const ped = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 2.0), M.die); ped.position.y = 0.09; LAB.add(ped);
  const plate = textPlane(512, 96, [["FERIT · Fe₂O₃ + Ni / Zn / Mn", `700 40px ${MONO}`, C.gold, 0.5]], 2.6); plate.rotation.x = -0.5; plate.position.set(0, 0.25, 1.15); LAB.add(plate);
  const wireA = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 9, 16), M.copper), wireB = wireA.clone();
  wireA.rotation.z = wireB.rotation.z = Math.PI / 2; wireA.position.set(0, RC + 0.38, 0); wireB.position.set(0, RC - 0.38, 0); LAB.add(wireA, wireB);
  const insA = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 9, 16, 1, true), new THREE.MeshPhysicalMaterial({ color: "#9fd8ff", transparent: true, opacity: 0.18, roughness: 0.1, depthWrite: false })), insB = insA.clone();
  insA.rotation.z = insB.rotation.z = Math.PI / 2; insA.position.copy(wireA.position); insB.position.copy(wireB.position); LAB.add(insA, insB);
  // field loops: small ones around each wire, big ones inside the ring (coaxial)
  const dashTex = canvasTex(256, 16, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#fff"; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(i * 32, 2); g.lineTo(i * 32 + 22, 8); g.lineTo(i * 32, 14); g.fill(); } });
  const loop = (rad, c) => { const m = new THREE.Mesh(new THREE.TorusGeometry(rad, rad * 0.05 + 0.015, 6, 64), new THREE.MeshBasicMaterial({ color: c, map: dashTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); m.rotation.y = Math.PI / 2; m.frustumCulled = false; return m; };
  const fA = [], fB = [], fBig = [];
  for (let i = 0; i < 5; i++) { const x = -3.2 + i * 1.6; const a = loop(0.42, C.cyan), b = loop(0.42, C.magenta); a.position.set(x, RC + 0.38, 0); b.position.set(x, RC - 0.38, 0); LAB.add(a, b); fA.push(a); fB.push(b); }
  for (let i = 0; i < 5; i++) { const m = loop(1.6, C.amber); m.position.set(-0.9 + i * 0.45, RC, 0); LAB.add(m); fBig.push(m); }
  const cancA = loop(1.6, C.cyan), cancB = loop(1.6, C.magenta); cancA.position.set(0.15, RC, 0); cancB.position.set(-0.15, RC, 0); LAB.add(cancA, cancB);
  // element orbs
  const ELS = [["s5:oksida", "Fe", "#a44a2a"], ["s5:nikel", "Ni", "#c9ccd0"], ["s5:seng", "Zn", "#8fa3b5"], ["s5:mangan", "Mn", "#b88aa0"]].map(([w, s, c], i) => {
    const g = new THREE.Group(); LAB.add(g);
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.7 })); o.castShadow = true; g.add(o);
    const l = textPlane(128, 128, [[s, `900 72px ${SANS}`, "#ffffff", 0.52]], 0.6); l.position.z = 0.43; g.add(l);
    return { g, w, i };
  });
  const bounce = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshBasicMaterial({ color: C.amber, toneMapped: false })); LAB.add(bounce);
  const heatP = pts(scene, 70, { color: C.heat, size: 0.28 });
  const labCur = pts(scene, 80, { color: C.cyan, size: 0.3 });

  // ---------------- TOKYO ----------------
  const TK = new THREE.Group(); TK.position.set(TX, 0, 0); scene.add(TK);
  const plin = new THREE.Mesh(rbox(3.2, 0.9, 1.6, 0.08), M.die); plin.position.y = 0.45; plin.castShadow = plin.receiveShadow = true; TK.add(plin);
  const samp = new THREE.Mesh(halfRing(0.2, 0.42, 0.5, 0, true), M.ferrite); samp.position.set(0, 1.35, 0); TK.add(samp);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.0, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: "#cfefff", transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false })); glass.position.set(0, 1.4, 0); TK.add(glass);
  const city = textPlane(1024, 220, [["TOKYO · 1930", `900 120px ${SANS}`, C.gold, 0.5]], 4.2); city.position.set(0, 3.3, -1.6); TK.add(city);
  const mkP = (name, x, top) => { const p = person({ skin: "#d6a982", top, bottom: "#24262b", hair: "#15110e" }); p.G.position.set(x, 0, 0.4); p.G.scale.setScalar(1.25); TK.add(p.G);
    const np = textPlane(512, 110, [[name, `700 50px ${MONO}`, "#e9efe9", 0.5]], 1.7, { bg: "rgba(4,17,13,.85)", border: C.gold }); np.position.set(x, 2.55, 0.5); TK.add(np); return p; };
  const pK = mkP("Yogoro Kato", -1.75, "#e8e6df"), pT = mkP("Takeshi Takei", 1.75, "#d9d4c8");
  pK.G.rotation.y = 0.45; pT.G.rotation.y = -0.45;
  const fac = new THREE.Group(); fac.position.set(4.4, 0, -1.0); TK.add(fac);
  const facB = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: "#d8d2c4", roughness: 0.7 })); facB.position.y = 0.8; facB.castShadow = true; fac.add(facB);
  for (let i = 0; i < 3; i++) { const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.38, 0.5, 3), new THREE.MeshStandardMaterial({ color: "#6b6f75", roughness: 0.6 })); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.position.set(-0.66 + i * 0.66, 1.75, 0); fac.add(roof); }
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 16), M.copper); stack.position.set(0.7, 2.2, -0.4); fac.add(stack);
  const yr = textPlane(256, 96, [["1935", `900 72px ${SANS}`, "#071410", 0.5]], 1.2); yr.position.set(0, 0.95, 0.81); fac.add(yr);

  // ---------------- camera ----------------
  const k = (t, ox, p, l) => [t, p[0] + ox, p[1], p[2], l[0] + ox, l[1], l[2]];
  const C1 = track([
    k(0, 0, [1.75, 0.95, 2.7], [0.55, 0.32, 0]),
    k(K.s1e, 0, [1.4, 0.85, 2.45], [0.6, 0.34, 0]),
    k(A("s2:cangkang"), 0, [1.05, 1.15, 2.4], [0.6, 0.32, 0]),
    k(A("s2:membungkus"), 0, [0.35, 1.25, 2.1], [0.6, 0.3, 0]),
    k(K.s2e, 0, [0.6, 1.55, 2.7], [0.7, 0.3, 0]),
    k(A("s3:antena"), 0, [3.2, 6.2, 12.5], [2.6, 0.4, -0.8]),
    k(A("s3:menangkap"), 0, [5.0, 5.4, 10.5], [3.4, 0.6, -1.6]),
    k(K.s3e, 0, [1.0, 4.0, 8.2], [-1.6, 0.9, 0]),
    k(K.s4 + 0.4, 0, [-0.6, 3.6, 6.2], [-3, 1.0, 0]),
    k(A("s4:Rangkaian"), 0, [-1.6, 3.9, 4.8], [-3, 1.1, 0]),
    k(A("s4:ratusan"), 0, [-2.3, 2.9, 4.4], [-3, 1.9, 0]),
    k(A("s4:derau"), 0, [0.2, 2.4, 5.0], [-0.8, 0.5, 0]),
    k(K.s5 - 0.05, 0, [1.7, 1.5, 3.8], [0.6, 0.35, 0]),
  ]);
  const C2 = track([
    k(K.s5, LX, [3.4, 4.2, 12.0], [0, 2.3, 0]),
    k(A("s5:oksida"), LX, [2.4, 3.8, 11.0], [0, 2.4, 0]),
    k(A("s5:magnetis"), LX, [1.2, 4.6, 10.6], [0, 2.4, 0]),
    k(A("s5:menghantarkan"), LX, [-1.4, 3.4, 10.4], [0, 2.4, 0]),
    k(K.s6, LX, [0.6, 2.9, 11.6], [0, 2.4, 0]),
    k(A("s6:meniadakan"), LX, [-0.8, 3.3, 10.4], [0, 2.4, 0]),
    k(A("s6:Derau"), LX, [0.9, 2.7, 9.8], [0, 2.4, 0]),
    k(A("s6:menumpuk"), LX, [0.4, 3.7, 9.2], [0, 2.5, 0]),
    k(A("s6:panas"), LX, [-0.2, 4.6, 10.8], [0, 2.8, 0]),
    k(K.s7 - 0.05, LX, [-0.5, 4.9, 11.4], [0, 2.9, 0]),
  ]);
  const C3 = track([
    k(K.s7, TX, [1.8, 2.4, 8.4], [0, 1.6, 0]),
    k(A("s7:Yogoro"), TX, [0.9, 2.1, 7.4], [0, 1.6, 0]),
    k(A("s7:Lima"), TX, [3.4, 3.0, 8.8], [2.4, 1.6, -0.6]),
    k(K.s8 - 0.05, TX, [3.8, 3.2, 9.2], [2.8, 1.6, -0.6]),
  ]);
  const C4 = track([
    k(K.s8, 0, [2.6, 2.6, 5.6], [1.4, 0.3, 0]),
    k(A("s8:AUDIRA"), 0, [3.0, 6.0, 11.0], [2.4, 0.3, -0.6]),
    k(K.dur, 0, [3.2, 7.2, 13.0], [2.6, 0.3, -0.6]),
  ]);
  const camAt = (t) => (t < K.s5 ? C1(t) : t < K.s7 ? C2(t) : t < K.s8 ? C3(t) : C4(t));
  const look = new THREE.Vector3();
  const R0 = mulberry(9), seeds = Array.from({ length: 120 }, () => R0());

  return (t) => {
    const c = camAt(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.41), c[1] + 0.02 * Math.sin(t * 0.57 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    grade.uniforms.flash.value = 0.55 * flashAt(t, [K.s5, K.s7, K.s8]);
    const inMain = t < K.s5 || t >= K.s8, inLab = t >= K.s5 && t < K.s7, inTk = t >= K.s7 && t < K.s8;
    MAIN.visible = inMain; LAB.visible = inLab; TK.visible = inTk;
    const sx = inLab ? LX : inTk ? TX : 1;
    key.position.set(sx - 6, 10, 8); key.target.position.set(sx, 0.5, 0); rim.position.set(sx + 5, 5, -9); rim.target.position.set(sx, 1, 0); fill.position.set(sx + 3, 3, 5);
    bp.strength = 0.55;

    // ----- MAIN -----
    const s8 = t >= K.s8;
    // bead opens in s2, closes again by s3 end; stays closed in s4, open a little in s8
    const open = s8 ? 0 : win(t, A("s2:cangkang"), K.s3 + 0.6, 0.6);
    shF.position.z = 0.75 * eout(open); shB.position.z = -0.75 * eout(open); shF.rotation.x = -0.3 * open; shB.rotation.x = 0.3 * open;
    ringS.material.emissiveIntensity = 0;
    // lid lifts on its back hinge in s4
    const lidO = s8 ? 0 : win(t, A("s4:Sumber") + 0.2, K.s4e, 0.7);
    lid.rotation.z = 1.15 * back(lidO, 1.1); SW.visible = lidO > 0.02;
    const sw = t > A("s4:menyala") - 0.2 && !s8 ? 1 : 0;
    chipGlow.material.opacity = sw * (0.5 + 0.5 * Math.sign(Math.sin(t * 40)));
    const scA = s8 ? 0 : win(t, A("s4:menyala") - 0.3, A("s4:derau") + 0.4, 0.4);
    SC.visible = scA > 0.01 && inMain; SC.scale.setScalar(0.6 + 0.4 * eout(scA)); scBg.material.opacity = 0.85 * scA; scEdge.material.opacity = scA; wave.material.opacity = scA; scLab.material.opacity = scA;
    SC.quaternion.copy(cam.quaternion);
    { const fr = 1 + 5 * ramp(t, A("s4:ratusan") - 0.3, A("s4:ratusan") + 0.8), ns = ramp(t, A("s4:derau") - 0.6, A("s4:derau") + 0.2);
      for (let i = 0; i < NW; i++) { const u = i / (NW - 1), ph = u * fr * 6.28 * 2 - t * 9; let y = Math.sin(ph) > 0 ? 0.32 : -0.32;
        const edge = Math.abs(Math.cos(ph)) > 0.985 ? 1 : 0; y += ns * edge * 0.18 * (seeds[i % 120] - 0.3) * 2;
        wavePos[i * 3] = -1.2 + 2.4 * u; wavePos[i * 3 + 1] = y - 0.05; wavePos[i * 3 + 2] = 0.01; }
      waveG.attributes.position.needsUpdate = true; }
    // radiated (cyan, growing) then received (amber, shrinking) rings along the cable
    const emit = inMain && !s8 ? win(t, A("s3:antena") - 0.4, A("s3:menangkap") - 0.3, 0.4) : 0;
    const recv = inMain && !s8 ? win(t, A("s3:menangkap") - 0.2, K.s3e + 0.2, 0.4) : 0;
    WAV.forEach((m, i) => {
      const along = 0.3 + 0.65 * ((i % 6) / 5), ph = ((t * 0.7 + Math.floor(i / 6) / 3) % 1);
      path.getPointAt(along, pathPt); path.getTangentAt(along, pathTan);
      m.position.copy(pathPt); m.lookAt(pathPt.x + pathTan.x, pathPt.y + pathTan.y, pathPt.z + pathTan.z);
      const em = i < 9 ? emit : recv, rad = i < 9 ? 0.2 + 2.4 * ph : 2.6 - 2.4 * ph;
      m.scale.setScalar(rad); m.material.color.set(i < 9 ? C.cyan : C.amber); m.material.opacity = em * (i < 9 ? 1 - ph : ph) * 0.9;
    });
    rdS.material.map = recv > 0.05 || (emit > 0.3 && t > A("s3:alat") - 0.1) ? statT[Math.floor(t * 15) % 3] : null; rdS.material.needsUpdate = true;
    rdS.material.color.set(rdS.material.map ? "#ffffff" : "#7fe9c9");
    RD.position.x = 4.6 + 0.03 * Math.sin(t * 50) * recv;
    // noise spikes from the charger to the bead, eaten there; clean current after s4 / in s8
    { const nOn = inMain ? ramp(t, A("s4:derau") - 0.4, A("s4:merambat")) * (1 - ramp(t, K.s5 - 0.3, K.s5)) : 0;
      for (let i = 0; i < 60; i++) { const u = ((t * 0.12 + seeds[i]) % 1) * 0.42; path.getPointAt(Math.min(u, 0.999), pathPt);
        const j = 0.12 * Math.sin(t * 37 + i * 3.1); noise.pos[i * 3] = pathPt.x; noise.pos[i * 3 + 1] = pathPt.y + 0.14 + Math.abs(j); noise.pos[i * 3 + 2] = pathPt.z + j * 0.5;
        const v = nOn * (u > 0.3 ? clamp01((0.36 - u) / 0.06) : 1); noise.col[i * 3] = v; noise.col[i * 3 + 1] = 0.71 * v; noise.col[i * 3 + 2] = 0.28 * v; }
      noise.commit();
      const cOn = s8 ? ramp(t, K.s8, K.s8 + 1) : 0;
      for (let i = 0; i < 40; i++) { const u = (t * 0.08 + i / 40) % 1; path.getPointAt(u, pathPt); curr.pos[i * 3] = pathPt.x; curr.pos[i * 3 + 1] = pathPt.y + 0.1; curr.pos[i * 3 + 2] = pathPt.z;
        curr.col[i * 3] = 0.22 * cOn; curr.col[i * 3 + 1] = 0.84 * cOn; curr.col[i * 3 + 2] = cOn; }
      curr.commit(); noise.P.visible = curr.P.visible = inMain; }
    ringS.material.emissiveIntensity = inMain ? 0.6 * ramp(t, A("s4:merambat") - 0.2, A("s4:merambat") + 0.6) * (1 - ramp(t, K.s5 - 0.2, K.s5)) : 0;

    // ----- LAB -----
    if (inLab) {
      // front half of the ring fades away in s6 so the inside reads
      const cut = ramp(t, K.s6 - 0.4, A("s6:Arus") + 0.4);
      bigF.material.opacity = 1 - 0.92 * cut; bigF.visible = cut < 0.97; bigF.material.depthWrite = cut < 0.3;
      ELS.forEach((e) => { const t0 = A(e.w), p = clamp01((t - t0 + 0.3) / 1.1), a = e.i * 1.57 + t * 0.6;
        const rr = 3.4 - 1.6 * eout(p), sink = ramp(t, A("s5:magnetis") - 0.2, A("s5:magnetis") + 0.6);
        e.g.position.set(Math.cos(a) * rr * (1 - sink * 0.9), RC + Math.sin(a) * rr * (1 - sink * 0.9), 1.4 + 0.6 * (1 - p));
        e.g.scale.setScalar(Math.max(0.001, back(p, 1.4) * (1 - sink))); e.g.lookAt(cam.position); });
      // magnetic: loops light up; conductive test: an amber pulse bounces off
      const mag = win(t, A("s5:magnetis") - 0.2, K.s5e, 0.4);
      const tb = A("s5:menghantarkan") - 0.6, pb = clamp01((t - tb) / 1.2);
      bounce.visible = pb > 0 && pb < 1; bounce.position.set(0, RC + 2.6 - 0.4 * Math.sin(pb * Math.PI), 2.6 - 2.0 * Math.sin(Math.min(pb, 0.5) * Math.PI)); bounce.scale.setScalar(1 - 0.6 * Math.max(0, pb - 0.5) * 2);
      // differential current: opposite directions on the two wires
      const diff = win(t, A("s6:Arus") - 0.2, A("s6:Derau") - 0.2, 0.4), cm = ramp(t, A("s6:searah") - 0.4, A("s6:searah") + 0.3);
      const cancel = ramp(t, A("s6:meniadakan") - 0.2, A("s6:meniadakan") + 0.7);
      for (let i = 0; i < 80; i++) { const top = i < 40, u = ((t * 0.18 + (i % 40) / 40) % 1), dir = top || cm > 0.5 ? 1 : -1;
        labCur.pos[i * 3] = LX - 4.5 + 9 * (dir > 0 ? u : 1 - u); labCur.pos[i * 3 + 1] = RC + (top ? 0.38 : -0.38) + 0.13; labCur.pos[i * 3 + 2] = 0.12;
        const amb = cm, on = Math.max(diff, cm * (1 - ramp(t, K.s6e - 0.4, K.s6e)));
        labCur.col[i * 3] = on * (0.22 + 0.78 * amb); labCur.col[i * 3 + 1] = on * (0.84 - 0.13 * amb); labCur.col[i * 3 + 2] = on * (1 - 0.72 * amb); }
      labCur.commit(); labCur.P.visible = true;
      fA.forEach((m, i) => { m.rotation.x = t * 3; m.material.opacity = diff * 0.9 * (1 - 0.6 * cancel); });
      fB.forEach((m, i) => { m.rotation.x = -t * 3; m.material.opacity = diff * 0.9 * (1 - 0.6 * cancel); m.material.color.set(cm > 0.5 ? C.amber : C.magenta); });
      cancA.rotation.x = t * 2.5; cancB.rotation.x = -t * 2.5;
      const cOp = diff * win(t, A("s6:Medan") - 0.1, A("s6:meniadakan") + 0.2, 0.3) * 0.9;
      cancA.material.opacity = cancB.material.opacity = cOp; cancA.scale.setScalar(1 - 0.5 * cancel); cancB.scale.setScalar(1 - 0.5 * cancel);
      const stackA = ramp(t, A("s6:menumpuk") - 0.5, A("s6:menumpuk") + 1.2);
      fBig.forEach((m, i) => { m.rotation.x = t * 2.2; m.material.opacity = cm * clamp01(stackA * 5 - i) * 0.95 * (1 - 0.5 * ramp(t, K.s6e - 0.5, K.s6e)); });
      const hot = ramp(t, A("s6:panas") - 0.4, A("s6:panas") + 0.8);
      M.ferrite.emissiveIntensity = 0.0; bigB.material.emissiveIntensity = 0.75 * hot * (0.85 + 0.15 * Math.sin(t * 5)); bigF.material.emissiveIntensity = bigB.material.emissiveIntensity;
      for (let i = 0; i < 70; i++) { const u = (t * 0.35 + seeds[i]) % 1, a = seeds[i + 40] * 6.28;
        heatP.pos[i * 3] = LX - 1.0 + 2.0 * seeds[(i + 13) % 120]; heatP.pos[i * 3 + 1] = RC + 2.1 * Math.sin(a) * 0.6 + 2.0 + u * 2.6; heatP.pos[i * 3 + 2] = Math.cos(a) * 1.2;
        const v = hot * (1 - u) * 0.9; heatP.col[i * 3] = v; heatP.col[i * 3 + 1] = 0.42 * v; heatP.col[i * 3 + 2] = 0.16 * v; }
      heatP.commit(); heatP.P.visible = true;
    } else { heatP.P.visible = false; labCur.P.visible = false; }

    // ----- TOKYO -----
    if (inTk) {
      const tY = A("s7:Yogoro"), tT = A("s7:Takeshi");
      pose(pK, { aR: -0.6 * ramp(t, tY - 0.3, tY + 0.4), eR: 0.9, hx: 0.12, hy: 0.25 });
      pose(pT, { aL: -0.7 * ramp(t, tT - 0.3, tT + 0.4), eL: 1.0, hx: 0.12, hy: -0.25 });
      samp.rotation.x = t * 0.6; samp.position.y = 1.38 + 0.04 * Math.sin(t * 1.5);
      const rise = back(clamp01((t - A("s7:berdirilah") + 0.5) / 0.8), 1.2);
      fac.scale.set(1, Math.max(0.001, rise), 1); fac.visible = rise > 0.002;
    }
    comp.render();
  };
}
