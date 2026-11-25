// EP20 LAMPU LED MODERN — CIRCUITFORGE style
// PCB green, copper traces, semiconductor chips, solder pads, LED blue glow + phosphor yellow
import * as THREE from "./three.module.js";
import { stage, track, canvasTex, box, cyl, std, envStrips, pts, label, mulberry, smooth, ramp, eout, clamp01 } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";

const P = {
  bg: 0x0A1628,
  pcb: 0x1B5E20,
  pcbDark: 0x0D3311,
  copper: 0xB87333,
  copperBright: 0xCD7F32,
  solder: 0xC0C0C0,
  chipBody: 0x1A1A2E,
  ledBlue: 0x2962FF,
  ledBlueBright: 0x448AFF,
  phosphor: 0xFFD600,
  phosphorDark: 0xF9A825,
  warmWhite: 0xFFFDE7,
  heatsink: 0x616161,
  heatsinkDark: 0x424242,
  gold: 0xFFD700,
  filament: 0xFF6D00,
  glass: 0xB2DFDB,
  accent: 0x00E676,
  red: 0xEF5350,
  textCopper: "#CD7F32",
  textGreen: "#66BB6A",
  textBlue: "#82B1FF",
};

const NanGuard = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r))c=vec4(0,0,0,1);gl_FragColor=c;}"
};
const Grade = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: NanGuard.vertexShader,
  fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);c.rgb=pow(c.rgb,vec3(1.04));c.rgb=mix(c.rgb,c.rgb*vec3(0.92,0.98,1.08),0.3);gl_FragColor=c;}"
};

function mat(color, rough = 0.55, metal = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}
function metalMat(color, rough = 0.3) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.85 });
}
function glassMat(color, opacity = 0.3) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0, transparent: true, opacity, side: THREE.DoubleSide });
}
function glowMat(color, intensity = 2) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, opacity: 0.85 });
}

// PCB board with etched edge and solder mask
function pcbBoard(w, d, h = 0.3, parent) {
  const g = new THREE.Group();
  const board = box(w, h, d, mat(P.pcb, 0.7), 0, 0, 0);
  g.add(board);
  // copper edge ring
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.15, h + 0.02, d + 0.15),
    metalMat(P.copper, 0.4)
  );
  edge.position.y = -0.02;
  g.add(edge);
  if (parent) parent.add(g);
  return g;
}

// copper trace line on board surface
function trace(x1, z1, x2, z2, parent, w = 0.12) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.06, w),
    metalMat(P.copper, 0.35)
  );
  m.position.set((x1 + x2) / 2, 0.18, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(dz, dx);
  if (parent) parent.add(m);
  return m;
}

// solder pad
function solderPad(x, z, parent, r = 0.2) {
  const m = cyl(r, r, 0.08, 16, metalMat(P.solder, 0.25), x, 0.19, z);
  if (parent) parent.add(m);
  return m;
}

// small SMD resistor
function resistor(x, z, parent, color = P.chipBody) {
  const g = new THREE.Group();
  g.position.set(x, 0.3, z);
  box(0.5, 0.25, 0.3, mat(color, 0.6), 0, 0, 0, g);
  box(0.08, 0.26, 0.31, metalMat(P.solder), -0.25, 0, 0, g);
  box(0.08, 0.26, 0.31, metalMat(P.solder), 0.25, 0, 0, g);
  if (parent) parent.add(g);
  return g;
}

// IC chip package
function chipPkg(w, d, parent, color = P.chipBody) {
  const g = new THREE.Group();
  box(w, 0.35, d, mat(color, 0.5), 0, 0.35, 0, g);
  // marking dot
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), mat(P.solder, 0.4));
  dot.rotation.x = -Math.PI / 2;
  dot.position.set(-w / 2 + 0.3, 0.53, -d / 2 + 0.3);
  g.add(dot);
  // pins on two sides
  for (let i = 0; i < Math.floor(w / 0.4); i++) {
    const px = -w / 2 + 0.3 + i * 0.4;
    box(0.08, 0.02, 0.35, metalMat(P.solder), px, 0.2, d / 2 + 0.15, g);
    box(0.08, 0.02, 0.35, metalMat(P.solder), px, 0.2, -d / 2 - 0.15, g);
  }
  if (parent) parent.add(g);
  return g;
}

// heatsink fin array
function heatsink(count, finH, finW, depth, parent) {
  const g = new THREE.Group();
  const spacing = finW * 1.6;
  const totalW = count * spacing;
  // base plate
  box(totalW, 0.4, depth, metalMat(P.heatsinkDark, 0.4), 0, 0, 0, g);
  for (let i = 0; i < count; i++) {
    const x = -totalW / 2 + spacing / 2 + i * spacing;
    box(finW * 0.15, finH, depth * 0.9, metalMat(P.heatsink, 0.35), x, finH / 2 + 0.2, 0, g);
  }
  if (parent) parent.add(g);
  return g;
}

// LED dome (hemisphere)
function ledDome(r, parent, color = P.glass, opacity = 0.25) {
  const geo = new THREE.SphereGeometry(r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const m = new THREE.Mesh(geo, glassMat(color, opacity));
  if (parent) parent.add(m);
  return m;
}

// wire bond curve
function wireBond(from, to, parent) {
  const mid = new THREE.Vector3(
    (from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 0.3, (from[2] + to[2]) / 2
  );
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...from), mid, new THREE.Vector3(...to)
  );
  const geo = new THREE.TubeGeometry(curve, 12, 0.02, 6, false);
  const m = new THREE.Mesh(geo, metalMat(P.gold, 0.2));
  if (parent) parent.add(m);
  return m;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, {
    bg: P.bg, fog: 0.008, exp: 1.15,
    bloom: [0.55, 0.5, 0.78], fov: 38, shadow: true
  });

  // NanGuard before bloom, Grade after output
  const passes = comp.passes;
  passes.splice(1, 0, new ShaderPass(NanGuard));
  comp.addPass(new ShaderPass(Grade));

  // Environment for metallic reflections
  envStrips(r, scene, [
    [50, 12, 0x4488cc, 2.0, 0, 18, -25],
    [35, 8, 0xcc8844, 1.8, -20, 14, 18],
    [30, 6, 0x44cc88, 1.5, 22, 10, 12],
    [20, 10, 0xffffff, 1.2, 5, 20, 5],
  ]);

  // Lights
  scene.add(new THREE.AmbientLight(0x1a2a40, 0.7));
  const key = new THREE.DirectionalLight(0xeef4ff, 1.6);
  key.position.set(6, 14, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -20; key.shadow.camera.right = 20;
  key.shadow.camera.top = 20; key.shadow.camera.bottom = -20;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4488ff, 0.5);
  rim.position.set(-8, 6, -10);
  scene.add(rim);

  // ground plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    mat(P.bg, 0.9)
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  ground.receiveShadow = true;
  scene.add(ground);

  const rng = mulberry(2020);

  // ── S1: x=0 — LED bulb glowing (hook) ──
  const s1 = new THREE.Group(); s1.position.x = 0; scene.add(s1);
  // LED bulb body
  const bulbBase = cyl(1.2, 1.5, 3, 24, metalMat(P.heatsinkDark), 0, 0, 0, s1);
  // heatsink ring
  for (let i = 0; i < 6; i++) {
    const ring = cyl(1.55, 1.55, 0.12, 24, metalMat(P.heatsink, 0.35), 0, -0.6 + i * 0.5, 0, s1);
  }
  // dome
  const s1dome = ledDome(1.8, s1, P.warmWhite, 0.2);
  s1dome.position.y = 1.5;
  // inner glow core
  const glowCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 12),
    glowMat(P.ledBlue, 1.5)
  );
  glowCore.position.y = 2.0;
  s1.add(glowCore);
  // phosphor ring around core
  const phRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.15, 12, 24),
    glowMat(P.phosphor, 1.2)
  );
  phRing.position.y = 2.0;
  phRing.rotation.x = Math.PI / 2;
  s1.add(phRing);
  // AUDIRA label on base (anti-reupload)
  const audiraLabel = label("AUDIRA", { w: 256, h: 64, font: "700 48px monospace", color: P.textCopper, size: 1.8 });
  audiraLabel.position.set(0, -1.2, 1.55);
  s1.add(audiraLabel);
  // screw base
  cyl(0.9, 0.7, 1.2, 16, metalMat(P.solder, 0.3), 0, -2.1, 0, s1);

  // ── S2: x=16 — Incandescent bulb (old tech) ──
  const s2 = new THREE.Group(); s2.position.x = 16; scene.add(s2);
  // glass envelope
  const envelope = new THREE.Mesh(
    new THREE.SphereGeometry(2, 24, 20),
    glassMat(0xfff8e1, 0.15)
  );
  envelope.position.y = 2;
  s2.add(envelope);
  // filament (coiled wire)
  const filCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 0.5, 0), new THREE.Vector3(0, 1.2, 0.2),
    new THREE.Vector3(0.2, 1.8, -0.1), new THREE.Vector3(-0.1, 2.5, 0.15),
    new THREE.Vector3(0.3, 3.2, 0), new THREE.Vector3(0, 3.5, -0.2),
  ]);
  const filGeo = new THREE.TubeGeometry(filCurve, 40, 0.04, 8, false);
  const filament = new THREE.Mesh(filGeo, glowMat(P.filament, 2.5));
  s2.add(filament);
  // support wires
  cyl(0.03, 0.03, 3, 6, metalMat(P.solder), -0.4, 1.5, 0, s2);
  cyl(0.03, 0.03, 3, 6, metalMat(P.solder), 0.4, 1.5, 0, s2);
  // base
  cyl(1.0, 0.8, 1.5, 16, metalMat(P.copper, 0.35), 0, -1.2, 0, s2);
  // heat wave arrows (simple cones pointing up)
  for (let i = 0; i < 5; i++) {
    const a = rng() * Math.PI * 2;
    const hr = 1.2 + rng() * 0.8;
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.6, 6),
      new THREE.MeshBasicMaterial({ color: P.red, transparent: true, opacity: 0.4 })
    );
    arrow.position.set(Math.cos(a) * hr, 3.5 + rng(), Math.sin(a) * hr);
    arrow.userData.phase = rng() * 6.28;
    s2.add(arrow);
  }

  // ── S3: x=32 — LED chip on PCB ──
  const s3 = new THREE.Group(); s3.position.x = 32; scene.add(s3);
  const s3board = pcbBoard(8, 6, 0.3, s3);
  // copper traces
  trace(-3, -2, -1, -1, s3); trace(-1, -1, 0, 0, s3);
  trace(1, 0, 3, -1, s3); trace(3, -1, 3.5, -2, s3);
  trace(-2, 1.5, -0.5, 0.5, s3); trace(0.5, 0.5, 2, 1.5, s3);
  // solder pads
  solderPad(-3, -2, s3); solderPad(3.5, -2, s3);
  solderPad(-2, 1.5, s3); solderPad(2, 1.5, s3);
  // central LED chip
  const s3chip = box(1.2, 0.4, 1.2, mat(P.chipBody, 0.4, 0.1), 0, 0.5, 0, s3);
  // blue emitter on chip
  const emitter = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.1, 0.6),
    glowMat(P.ledBlue, 2)
  );
  emitter.position.set(0, 0.75, 0);
  s3.add(emitter);
  // wire bonds
  wireBond([-0.5, 0.7, -0.5], [-1, 0.2, -1], s3);
  wireBond([0.5, 0.7, 0.5], [1, 0.2, 1], s3);
  // resistors and caps
  resistor(-2.5, 0, s3, 0x33691E);
  resistor(2.5, 0, s3, 0x1A237E);
  // label text
  const ledLabel = label("LED CHIP", { w: 256, h: 64, font: "700 44px monospace", color: "#82B1FF", size: 2.5 });
  ledLabel.position.set(0, 2.5, 0);
  s3.add(ledLabel);

  // ── S4: x=48 — Chip layers (N-type / P-type) ──
  const s4 = new THREE.Group(); s4.position.x = 48; scene.add(s4);
  // Substrate
  box(5, 0.6, 4, mat(P.heatsinkDark, 0.5, 0.2), 0, -1.5, 0, s4);
  const subLabel = label("SUBSTRAT", { w: 256, h: 48, font: "600 36px monospace", color: "#aaa", size: 2 });
  subLabel.position.set(0, -1.5, 2.2); s4.add(subLabel);
  // N-type layer (electron rich — blue tint)
  box(5, 1, 4, mat(0x1565C0, 0.5, 0.1), 0, -0.5, 0, s4);
  const nLabel = label("TIPE-N (ELEKTRON)", { w: 384, h: 48, font: "700 36px monospace", color: "#82B1FF", size: 3 });
  nLabel.position.set(0, -0.5, 2.2); s4.add(nLabel);
  // Active region (junction — bright)
  box(5, 0.2, 4, glowMat(P.ledBlue, 1.5), 0, 0.1, 0, s4);
  // P-type layer (hole rich — warm tint)
  box(5, 1, 4, mat(0xC62828, 0.5, 0.1), 0, 0.7, 0, s4);
  const pLabel = label("TIPE-P (LUBANG)", { w: 384, h: 48, font: "700 36px monospace", color: "#EF9A9A", size: 3 });
  pLabel.position.set(0, 0.7, 2.2); s4.add(pLabel);
  // wire contacts on top and bottom
  box(1.5, 0.15, 1, metalMat(P.gold, 0.2), 0, 1.28, 0, s4);
  box(1.5, 0.15, 1, metalMat(P.gold, 0.2), 0, -1.88, 0, s4);
  // + and - symbols
  const plusLabel = label("+", { w: 64, h: 64, font: "700 56px monospace", color: "#EF9A9A", size: 1 });
  plusLabel.position.set(3, 0.7, 2.2); s4.add(plusLabel);
  const minusLabel = label("−", { w: 64, h: 64, font: "700 56px monospace", color: "#82B1FF", size: 1 });
  minusLabel.position.set(3, -0.5, 2.2); s4.add(minusLabel);

  // ── S5: x=64 — Electron-hole recombination ──
  const s5 = new THREE.Group(); s5.position.x = 64; scene.add(s5);
  // junction zone
  box(6, 3, 4, mat(0x0D47A1, 0.6), 0, 0, 0, s5);
  // glow at junction center
  const junctionGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 12),
    glowMat(P.ledBlueBright, 2.5)
  );
  junctionGlow.position.y = 0;
  s5.add(junctionGlow);
  // photon burst rings
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2 + i * 0.5, 0.04, 8, 32),
      glowMat(P.ledBlue, 1.5 - i * 0.3)
    );
    ring.position.y = 0;
    ring.userData.baseScale = 1;
    ring.userData.phase = i * 1.2;
    s5.add(ring);
  }
  // electron symbols (small blue spheres) on left
  for (let i = 0; i < 4; i++) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), glowMat(P.ledBlue, 1.5));
    e.position.set(-2.2 + rng() * 0.5, -0.8 + i * 0.5, rng() * 2 - 1);
    e.userData.ox = e.position.x;
    e.userData.phase = rng() * 6.28;
    s5.add(e);
  }
  // hole symbols (small red spheres) on right
  for (let i = 0; i < 4; i++) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), glowMat(P.red, 1.5));
    h.position.set(2.2 - rng() * 0.5, -0.8 + i * 0.5, rng() * 2 - 1);
    h.userData.ox = h.position.x;
    h.userData.phase = rng() * 6.28;
    s5.add(h);
  }
  const fotonLabel = label("FOTON", { w: 192, h: 48, font: "700 40px monospace", color: "#FFD600", size: 2 });
  fotonLabel.position.set(0, 2.5, 0); s5.add(fotonLabel);

  // ── S6: x=80 — Full LED lamp anatomy ──
  const s6 = new THREE.Group(); s6.position.x = 80; scene.add(s6);
  // heatsink base
  const s6hs = heatsink(8, 2.5, 0.6, 3, s6);
  s6hs.position.y = -1.5;
  // driver PCB inside
  const driverBoard = pcbBoard(3, 2.5, 0.2, s6);
  driverBoard.position.set(0, 0.5, 0);
  chipPkg(1.5, 1, driverBoard, P.chipBody);
  resistor(-1, -0.8, driverBoard, 0x33691E);
  resistor(1, 0.8, driverBoard, 0x4A148C);
  // capacitor (cylindrical)
  cyl(0.25, 0.25, 0.8, 12, mat(0x1565C0, 0.5), -1, 0.7, 0.8, driverBoard);
  // LED chip on top
  const s6chip = box(0.8, 0.25, 0.8, mat(P.chipBody, 0.4), 0, 1.5, 0, s6);
  const s6emitter = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.5),
    glowMat(P.ledBlue, 2)
  );
  s6emitter.position.set(0, 1.66, 0); s6.add(s6emitter);
  // phosphor layer
  const s6phosphor = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.1, 0.9),
    new THREE.MeshBasicMaterial({ color: P.phosphor, transparent: true, opacity: 0.6 })
  );
  s6phosphor.position.set(0, 1.78, 0); s6.add(s6phosphor);
  // dome on top
  const s6dome = ledDome(1.5, s6, P.warmWhite, 0.15);
  s6dome.position.y = 1.8;
  // label: GaN
  const ganLabel = label("GaN", { w: 128, h: 48, font: "700 40px monospace", color: "#82B1FF", size: 1.2 });
  ganLabel.position.set(1.5, 1.65, 0); s6.add(ganLabel);
  // label: FOSFOR
  const fosLabel = label("FOSFOR", { w: 192, h: 48, font: "700 36px monospace", color: "#FFD600", size: 1.5 });
  fosLabel.position.set(1.8, 1.85, 0); s6.add(fosLabel);
  // label: DRIVER
  const drvLabel = label("DRIVER", { w: 192, h: 48, font: "700 36px monospace", color: "#66BB6A", size: 1.5 });
  drvLabel.position.set(-2.2, 0.5, 1.5); s6.add(drvLabel);
  // label: HEATSINK
  const hsLabel = label("HEATSINK", { w: 256, h: 48, font: "700 36px monospace", color: "#BDBDBD", size: 2 });
  hsLabel.position.set(0, -2.8, 1.8); s6.add(hsLabel);

  // ── S7: x=96 — Nobel Prize 2014 ──
  const s7 = new THREE.Group(); s7.position.x = 96; scene.add(s7);
  // medallion base
  const medal = cyl(2.5, 2.5, 0.3, 32, metalMat(P.gold, 0.15), 0, 2, 0, s7);
  medal.rotation.x = Math.PI / 6;
  // Nobel text on medallion
  const nobelFace = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#B8860B";
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#FFD700";
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#8B6914";
    g.font = "700 72px serif";
    g.textAlign = "center";
    g.fillText("NOBEL", w / 2, h / 2 - 30);
    g.font = "600 56px serif";
    g.fillText("FISIKA", w / 2, h / 2 + 40);
    g.font = "700 80px serif";
    g.fillText("2014", w / 2, h / 2 + 120);
  });
  const medalFace = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 32),
    new THREE.MeshBasicMaterial({ map: nobelFace, transparent: false })
  );
  medalFace.position.set(0, 2, 0.16);
  medalFace.rotation.x = Math.PI / 6;
  s7.add(medalFace);
  // ribbon
  const ribbon = box(0.8, 3, 0.05, mat(0x1565C0, 0.4), 0, -0.5, 0, s7);
  // names platform
  const namePlate = box(6, 0.3, 2.5, metalMat(P.heatsinkDark, 0.4), 0, -2.5, 0, s7);
  // name labels
  const name1 = label("Akasaki", { w: 256, h: 48, font: "600 40px serif", color: "#FFD700", size: 2.2 });
  name1.position.set(-2, -1.8, 1.3); s7.add(name1);
  const name2 = label("Amano", { w: 256, h: 48, font: "600 40px serif", color: "#FFD700", size: 2.2 });
  name2.position.set(0, -1.8, 1.3); s7.add(name2);
  const name3 = label("Nakamura", { w: 256, h: 48, font: "600 40px serif", color: "#FFD700", size: 2.2 });
  name3.position.set(2.2, -1.8, 1.3); s7.add(name3);
  // blue LED icon
  const blueLed = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), glowMat(P.ledBlue, 2));
  blueLed.position.set(0, 4.5, 0); s7.add(blueLed);

  // ── S8: x=112 — Conclusion, LED vs incandescent ──
  const s8 = new THREE.Group(); s8.position.x = 112; scene.add(s8);
  // LED side (left) — efficient
  const ledSide = new THREE.Group(); ledSide.position.x = -2.5; s8.add(ledSide);
  cyl(0.8, 1, 2, 16, metalMat(P.heatsinkDark), 0, -0.5, 0, ledSide);
  const s8dome = ledDome(1.2, ledSide, P.warmWhite, 0.18);
  s8dome.position.y = 0.5;
  const s8glow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), glowMat(P.ledBlue, 1.5));
  s8glow.position.y = 0.8; ledSide.add(s8glow);
  const effLabel = label("300+ lm/W", { w: 256, h: 48, font: "700 40px monospace", color: "#66BB6A", size: 2.2 });
  effLabel.position.set(0, 3, 0); ledSide.add(effLabel);
  // Incandescent side (right) — wasteful
  const oldSide = new THREE.Group(); oldSide.position.x = 2.5; s8.add(oldSide);
  const s8env = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 16), glassMat(0xfff8e1, 0.12));
  s8env.position.y = 1; oldSide.add(s8env);
  const s8fil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6),
    glowMat(P.filament, 1.5)
  );
  s8fil.position.y = 1; oldSide.add(s8fil);
  cyl(0.6, 0.5, 1, 12, metalMat(P.copper, 0.35), 0, -0.7, 0, oldSide);
  const oldLabel = label("16 lm/W", { w: 256, h: 48, font: "700 40px monospace", color: "#EF5350", size: 2.2 });
  oldLabel.position.set(0, 3, 0); oldSide.add(oldLabel);
  // vs label
  const vsLabel = label("VS", { w: 96, h: 64, font: "900 56px monospace", color: "#FFD600", size: 1.5 });
  vsLabel.position.set(0, 1.5, 0); s8.add(vsLabel);

  // ── Particles: photons (float through scenes) ──
  const photonCount = 120;
  const photons = pts(scene, photonCount, { color: P.ledBlue, size: 0.25, add: true, opacity: 0.7 });
  for (let i = 0; i < photonCount; i++) {
    photons.pos[i * 3] = rng() * 128 - 8;
    photons.pos[i * 3 + 1] = rng() * 8 - 2;
    photons.pos[i * 3 + 2] = rng() * 10 - 5;
    const c = new THREE.Color().setHSL(0.6 + rng() * 0.1, 0.9, 0.6 + rng() * 0.3);
    photons.col[i * 3] = c.r; photons.col[i * 3 + 1] = c.g; photons.col[i * 3 + 2] = c.b;
  }
  photons.commit();

  // ── Electron particles for s5 region ──
  const eCount = 40;
  const electrons = pts(scene, eCount, { color: P.ledBlue, size: 0.18, add: true, opacity: 0.9 });

  // ── Camera track ──
  const camPath = track([
    [0,       0, 5, 14,    0, 1, 0],
    [K.s1,    0, 4.5, 12,  0, 1, 0],
    [K.s2,    16, 5, 13,   16, 1.5, 0],
    [K.s2e,   16, 3.5, 10, 16, 1, 0],
    [K.s3,    32, 4, 11,   32, 0.5, 0],
    [K.s3e,   32, 3, 8,    32, 0.5, 0],
    [K.s4,    48, 4, 10,   48, 0, 0],
    [K.s4e,   48, 2.5, 7,  48, -0.2, 0],
    [K.s5,    64, 3.5, 10, 64, 0, 0],
    [K.s5e,   64, 2, 7,    64, 0, 0],
    [K.s6,    80, 5, 12,   80, 0, 0],
    [K.s6e,   80, 2, 8,    80, 0.5, 0],
    [K.s7,    96, 5, 13,   96, 1, 0],
    [K.s7e,   96, 3, 9,    96, 0.5, 0],
    [K.s8,    112, 5, 13,  112, 1, 0],
    [K.end,   112, 3.5, 10, 112, 1, 0],
    [K.outro, 112, 4, 14,  112, 1, 0],
  ]);

  // Animation state
  let prevT = 0;

  return function draw(t) {
    // Camera
    const cp = camPath(t);
    cam.position.set(cp[0], cp[1], cp[2]);
    cam.lookAt(cp[3], cp[4], cp[5]);

    // S1 glow pulse
    const s1pulse = 1 + 0.15 * Math.sin(t * 3);
    glowCore.scale.setScalar(s1pulse);
    phRing.scale.setScalar(0.95 + 0.1 * Math.sin(t * 2.5 + 1));

    // S2 heat wave animation
    s2.children.forEach(c => {
      if (c.userData.phase !== undefined) {
        c.position.y += 0.003;
        c.material.opacity = 0.3 + 0.15 * Math.sin(t * 2 + c.userData.phase);
        if (c.position.y > 5.5) c.position.y = 3;
      }
    });

    // S5 electron-hole drift toward center
    const s5active = ramp(t, K.s5, K.s5 + 2);
    s5.children.forEach(c => {
      if (c.userData.ox !== undefined) {
        const drift = s5active * 0.6 * Math.sign(-c.userData.ox);
        c.position.x = c.userData.ox + drift + 0.1 * Math.sin(t * 3 + c.userData.phase);
      }
    });
    // junction glow pulse
    junctionGlow.scale.setScalar(1 + 0.3 * Math.sin(t * 4) * ramp(t, K.s5 + 1, K.s5 + 3));
    // photon rings expand
    s5.children.forEach(c => {
      if (c.userData.baseScale !== undefined) {
        const age = (t - K.s5 + c.userData.phase) % 3;
        const s = 1 + age * 0.4;
        c.scale.setScalar(s);
        c.material.opacity = Math.max(0, 0.6 - age * 0.2);
        c.rotation.z = t * 0.5 + c.userData.phase;
      }
    });

    // S6 phosphor glow
    const s6pulse = ramp(t, K.s6, K.s6 + 2);
    s6phosphor.material.opacity = 0.3 + 0.4 * s6pulse;
    s6emitter.material.color.setScalar(1.5 + 0.5 * Math.sin(t * 4));

    // S7 medal gentle rotation
    medal.rotation.y = Math.sin(t * 0.5) * 0.15;
    medalFace.rotation.y = medal.rotation.y;

    // Photon particles drift
    for (let i = 0; i < photonCount; i++) {
      photons.pos[i * 3 + 1] += 0.008 * Math.sin(t * 2 + i);
      photons.pos[i * 3 + 2] += 0.003 * Math.cos(t * 1.5 + i * 0.3);
    }
    photons.commit();

    // Electron particles in s5 region
    const eActive = ramp(t, K.s5 - 0.5, K.s5 + 1);
    for (let i = 0; i < eCount; i++) {
      const ox = 64 + (rng() - 0.5) * 6;
      const oy = (rng() - 0.5) * 3;
      const oz = (rng() - 0.5) * 4;
      electrons.pos[i * 3] = ox + Math.sin(t * 3 + i) * 0.3 * eActive;
      electrons.pos[i * 3 + 1] = oy + Math.cos(t * 2.5 + i * 0.7) * 0.2;
      electrons.pos[i * 3 + 2] = oz;
    }
    electrons.m.opacity = eActive * 0.8;
    electrons.commit();

    prevT = t;
    comp.render();
  };
}
