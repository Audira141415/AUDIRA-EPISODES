import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, clamp01, ramp, eout, track, stage, std, box, cyl, canvasTex, envStrips, label, pts } from "./lib3d.js";

const P = {
  bg: 0x1a1a1a, fire1: 0xff4500, fire2: 0x8b0000,
  warn: 0xff6600, alarm: 0xffd700, water: 0x0066cc,
  waterL: 0x66aadd, smoke: 0x2d2d2d, metal: 0x666666,
  metalL: 0x888888, concrete: 0x3a3a3a, glass: 0xcc3333,
  pipe: 0x556b55, white: 0xffe0b2, emRed: 0xff2200,
};

const mat = {
  metal: () => std(P.metal, 0.35, 0.85),
  metalL: () => std(P.metalL, 0.3, 0.9),
  concrete: () => std(P.concrete, 0.92, 0),
  pipe: () => std(P.pipe, 0.4, 0.7),
  glass: () => new THREE.MeshPhysicalMaterial({ color: P.glass, roughness: 0.05, metalness: 0, transmission: 0.7, thickness: 0.3, ior: 1.5, transparent: true, opacity: 0.6 }),
  liquid: () => std(P.fire2, 0.3, 0, { transparent: true, opacity: 0.85 }),
  water: () => std(P.water, 0.2, 0, { transparent: true, opacity: 0.5 }),
  warn: () => std(P.alarm, 0.5, 0),
  ember: () => new THREE.MeshBasicMaterial({ color: P.fire1 }),
  floor: () => std(0x222222, 0.95, 0),
};

function ceiling(w, d, parent, x, z) {
  const c = box(w, 0.3, d, mat.concrete(), x, 10, z);
  parent.add(c);
  return c;
}

function pipeH(len, parent, x, y, z) {
  const p = cyl(0.18, 0.18, len, 12, mat.pipe(), x, y, z);
  p.rotation.z = Math.PI / 2;
  parent.add(p);
  return p;
}

function pipeV(len, parent, x, y, z) {
  const p = cyl(0.14, 0.14, len, 10, mat.pipe(), x, y, z);
  parent.add(p);
  return p;
}

function sprinklerHead(parent, x, y, z, bulbColor) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const body = cyl(0.22, 0.28, 0.35, 14, mat.metal(), 0, 0, 0);
  g.add(body);
  const frame1 = box(0.04, 0.7, 0.04, mat.metalL(), -0.2, -0.35, 0);
  const frame2 = box(0.04, 0.7, 0.04, mat.metalL(), 0.2, -0.35, 0);
  g.add(frame1, frame2);
  const deflector = cyl(0.4, 0.45, 0.06, 16, mat.metalL(), 0, -0.72, 0);
  g.add(deflector);
  const bulbMat = new THREE.MeshPhysicalMaterial({
    color: bulbColor || P.glass, roughness: 0.05, metalness: 0,
    transmission: 0.6, thickness: 0.2, ior: 1.5, transparent: true, opacity: 0.7,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), bulbMat);
  bulb.position.y = -0.35;
  bulb.scale.set(0.7, 1.4, 0.7);
  g.add(bulb);
  parent.add(g);
  return { g, bulb, deflector, body };
}

function fireCluster(parent, x, y, z, scale) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const s = scale || 1;
  for (let i = 0; i < 5; i++) {
    const h = (0.4 + Math.random() * 0.8) * s;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.15 * s, h, 6),
      new THREE.MeshBasicMaterial({ color: i < 2 ? P.alarm : P.fire1, transparent: true, opacity: 0.7 })
    );
    cone.position.set((Math.random() - 0.5) * 0.6 * s, h / 2, (Math.random() - 0.5) * 0.6 * s);
    g.add(cone);
  }
  parent.add(g);
  return g;
}

function buildingSection(parent, x) {
  const g = new THREE.Group();
  g.position.set(x, 0, 0);
  const wallMat = std(0x444444, 0.85, 0);
  const floorMat = std(0x333333, 0.9, 0);
  for (let f = 0; f < 3; f++) {
    const fy = f * 4;
    box(12, 0.2, 6, floorMat, 0, fy, 0, g);
    box(0.2, 4, 6, wallMat, -6, fy + 2, 0, g);
    box(0.2, 4, 6, wallMat, 6, fy + 2, 0, g);
    box(12, 0.2, 0.2, mat.concrete(), 0, fy + 4, -3, g);
    pipeH(10, g, 0, fy + 3.6, -1.5);
    for (let sx = -3; sx <= 3; sx += 3) {
      pipeV(0.5, g, sx, fy + 3.35, -1.5);
      sprinklerHead(g, sx, fy + 3.05, -1.5, P.glass);
    }
  }
  parent.add(g);
  return g;
}

function colorBulbs(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const colors = [
    { c: 0xff3333, t: "57°C", name: "ORANYE" },
    { c: 0xff0000, t: "68°C", name: "MERAH" },
    { c: 0xffdd00, t: "79°C", name: "KUNING" },
    { c: 0x33cc33, t: "93°C", name: "HIJAU" },
    { c: 0x3366ff, t: "141°C", name: "BIRU" },
  ];
  colors.forEach((col, i) => {
    const bx = (i - 2) * 2.2;
    const bulbMat = new THREE.MeshPhysicalMaterial({
      color: col.c, roughness: 0.05, metalness: 0,
      transmission: 0.5, thickness: 0.2, transparent: true, opacity: 0.8,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 12), bulbMat);
    bulb.position.set(bx, 0, 0);
    bulb.scale.set(0.6, 1.5, 0.6);
    g.add(bulb);
    const lbl = label(col.t, { w: 256, h: 64, font: "700 48px monospace", color: "#fff", bg: "rgba(0,0,0,0.7)", size: 1.8 });
    lbl.position.set(bx, -1.2, 0.1);
    g.add(lbl);
    if (i === 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.05, 8, 24),
        new THREE.MeshBasicMaterial({ color: P.alarm })
      );
      ring.position.set(bx, 0, 0);
      g.add(ring);
    }
  });
  parent.add(g);
  return g;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, {
    bg: P.bg, fog: 0.006, exp: 1.15, bloom: [0.55, 0.65, 0.8], fov: 38, shadow: true,
  });

  // NaN guard before bloom
  const nanPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(clamp(c.rgb,vec3(0.),vec3(64.)),c.a);}",
  });
  comp.passes.splice(1, 0, nanPass);

  envStrips(r, scene, [
    [40, 18, 0xff4400, 0.35, 0, 14, -28],
    [30, 12, 0x4488cc, 0.2, -18, 12, 22],
    [50, 14, 0xffffee, 0.15, 12, 20, -18],
  ], 0x080808);

  const amb = new THREE.AmbientLight(0x221111, 0.35);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffaa66, 0.7);
  dir.position.set(8, 18, 12);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.left = -20; dir.shadow.camera.right = 20;
  dir.shadow.camera.top = 20; dir.shadow.camera.bottom = -5;
  scene.add(dir);

  const fireL1 = new THREE.PointLight(P.fire1, 2.5, 20, 1.5);
  fireL1.position.set(0, 2, 2);
  scene.add(fireL1);
  const fireL2 = new THREE.PointLight(P.fire1, 1.8, 18, 1.5);
  fireL2.position.set(54, 2, 1);
  scene.add(fireL2);
  const waterL = new THREE.PointLight(P.water, 1.2, 15, 2);
  waterL.position.set(72, 5, 0);
  scene.add(waterL);

  const ground = box(180, 0.1, 14, mat.floor(), 63, -0.05, 0);
  scene.add(ground);

  // s1: Hook — single sprinkler close-up with fire below
  const g1 = new THREE.Group(); g1.position.set(0, 0, 0); scene.add(g1);
  ceiling(8, 8, g1, 0, 0);
  pipeH(6, g1, 0, 9.5, 0);
  pipeV(0.6, g1, 0, 9.15, 0);
  const sp1 = sprinklerHead(g1, 0, 8.8, 0);
  fireCluster(g1, 0, 0, 1, 1.5);
  fireCluster(g1, -1, 0, 0.5, 1);
  fireCluster(g1, 1, 0, -0.3, 0.8);

  // s2: Pipe system — sprinkler = small valve
  const g2 = new THREE.Group(); g2.position.set(18, 0, 0); scene.add(g2);
  ceiling(14, 8, g2, 0, 0);
  pipeH(12, g2, 0, 9.5, 0);
  for (let i = -4; i <= 4; i += 2) {
    pipeV(0.5, g2, i, 9.2, 0);
    sprinklerHead(g2, i, 8.9, 0);
  }
  const valveLabel = label("KATUP KECIL", { w: 512, h: 96, font: "700 56px monospace", color: "#FFD700", bg: "rgba(20,0,0,0.8)", size: 3.5 });
  valveLabel.position.set(0, 7.5, 1);
  g2.add(valveLabel);
  const waterPipe = cyl(0.14, 0.14, 12, 10, mat.water(), 0, 9.5, 0);
  waterPipe.rotation.z = Math.PI / 2;
  g2.add(waterPipe);

  // s3: Glass bulb detail — tabung kaca kecil
  const g3 = new THREE.Group(); g3.position.set(36, 0, 0); scene.add(g3);
  const bigBulb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.6, 2.5, 12, 16),
    mat.glass()
  );
  bigBulb.position.set(0, 6, 0);
  g3.add(bigBulb);
  const liquidInside = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 2.0, 10, 14),
    mat.liquid()
  );
  liquidInside.position.set(0, 5.8, 0);
  g3.add(liquidInside);
  const sumbat = cyl(0.35, 0.35, 0.3, 10, mat.metalL(), 0, 4.35, 0);
  g3.add(sumbat);
  const arrowDown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 6), std(P.alarm, 0.5, 0));
  arrowDown.position.set(0, 4.8, 0.8);
  arrowDown.rotation.x = Math.PI;
  g3.add(arrowDown);
  const mechLabel = label("SUMBAT", { w: 256, h: 64, font: "700 48px monospace", color: "#FF6600", bg: "rgba(0,0,0,0.7)", size: 2 });
  mechLabel.position.set(0, 3.8, 0.5);
  g3.add(mechLabel);

  // s4: Heat rising — fire below, bulb pressurizing
  const g4 = new THREE.Group(); g4.position.set(54, 0, 0); scene.add(g4);
  ceiling(8, 8, g4, 0, 0);
  pipeH(4, g4, 0, 9.5, 0);
  pipeV(0.6, g4, 0, 9.15, 0);
  const sp4 = sprinklerHead(g4, 0, 8.8, 0);
  fireCluster(g4, 0, 0, 1, 2);
  fireCluster(g4, -1.5, 0, 0, 1.3);
  fireCluster(g4, 1.2, 0, -0.5, 1.1);
  const thermoBg = box(0.3, 3, 0.1, std(0x333333, 0.8, 0), 3, 5, 2);
  g4.add(thermoBg);
  const thermoFill = box(0.22, 0.1, 0.12, std(P.fire1, 0.3, 0), 3, 3.6, 2.08);
  g4.add(thermoFill);

  // s5: Bulb shatters — water sprays
  const g5 = new THREE.Group(); g5.position.set(72, 0, 0); scene.add(g5);
  ceiling(8, 8, g5, 0, 0);
  pipeH(4, g5, 0, 9.5, 0);
  pipeV(0.6, g5, 0, 9.15, 0);
  const sp5body = cyl(0.22, 0.28, 0.35, 14, mat.metal(), 0, 8.8, 0);
  g5.add(sp5body);
  const defl5 = cyl(0.45, 0.5, 0.06, 16, mat.metalL(), 0, 8.1, 0);
  g5.add(defl5);
  const shardMat = new THREE.MeshBasicMaterial({ color: P.glass, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 12; i++) {
    const sh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06 + Math.random() * 0.06), shardMat);
    sh.position.set((Math.random() - 0.5) * 1.5, 7.5 + Math.random() * 1.5, (Math.random() - 0.5) * 1.5);
    sh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    g5.add(sh);
  }
  const waterCone = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 4, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: P.waterL, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  waterCone.position.set(0, 6, 0);
  g5.add(waterCone);

  // s6: Building cross-section
  buildingSection(scene, 90);

  // s7: Color code bulbs
  const g7 = new THREE.Group(); g7.position.set(108, 0, 0); scene.add(g7);
  ceiling(14, 8, g7, 0, 0);
  colorBulbs(g7, 0, 6, 0);
  const audiraLabel = label("AUDIRA", { w: 384, h: 80, font: "700 56px sans-serif", color: "#FF6600", bg: "rgba(10,10,10,0.85)", size: 3 });
  audiraLabel.position.set(-4, 3, 2);
  audiraLabel.rotation.y = 0.3;
  g7.add(audiraLabel);

  // s8: Conclusion
  const g8 = new THREE.Group(); g8.position.set(126, 0, 0); scene.add(g8);
  ceiling(10, 10, g8, 0, 0);
  pipeH(8, g8, 0, 9.5, 0);
  pipeV(0.6, g8, 0, 9.15, 0);
  sprinklerHead(g8, 0, 8.8, 0);
  const waterCone8 = new THREE.Mesh(
    new THREE.ConeGeometry(2, 3.5, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: P.waterL, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
  );
  waterCone8.position.set(0, 5.5, 0);
  g8.add(waterCone8);

  // Camera track
  const camPath = track([
    [0,    1, 5, 6,     0, 8.5, 0],
    [3.5,  -1, 6, 5,    0, 8, 0],
    [7.4,  -1, 7, 5,    0, 8, 0],
    [8,    17, 8, 7,     18, 9, 0],
    [12,   19, 7.5, 5,   18, 8.5, 0],
    [15.9, 19, 7, 5,     18, 8.5, 0],
    [16.2, 35, 6, 4,     36, 6, 0],
    [20,   37, 5.5, 3.5, 36, 5.5, 0],
    [22.8, 37, 5, 3,     36, 5, 0],
    [23,   53, 5, 6,     54, 6, 1],
    [27,   55, 4, 5,     54, 7, 0],
    [31.7, 55, 3, 5,     54, 8, 0],
    [32,   71, 6, 6,     72, 7, 0],
    [37,   73, 5, 4,     72, 7.5, 0],
    [42.7, 73, 4.5, 4,   72, 7, 0],
    [43,   82, 6, 12,    90, 6, 0],
    [48,   85, 8, 10,    90, 5, 0],
    [54.5, 88, 7, 8,     90, 6, 0],
    [54.8, 107, 6.5, 5,  108, 6, 0],
    [60,   109, 6, 4,    108, 5.5, 0],
    [65.4, 109, 5.5, 4,  108, 5, 0],
    [65.6, 125, 6, 7,    126, 7, 0],
    [70,   127, 5.5, 6,  126, 7.5, 0],
    [K.outro, 127, 5, 5, 126, 8, 0],
  ]);

  // Particles
  const firePts = pts(scene, 180, { color: P.fire1, size: 0.35, add: true, opacity: 0.8 });
  const waterPts = pts(scene, 250, { color: P.water, size: 0.2, add: true, opacity: 0.65 });
  const smokePts = pts(scene, 100, { color: 0x555555, size: 0.6, add: false, opacity: 0.3 });

  const rnd = mulberry(17);

  // Animated thermometer fill height
  let thermoH = 0;

  return function draw(t) {
    const [cx, cy, cz, lx, ly, lz] = camPath(t);
    cam.position.set(cx, cy, cz);
    cam.lookAt(lx, ly, lz);

    // Fire lights flicker
    const flick = Math.sin(t * 9) * 0.4 + Math.sin(t * 14.3) * 0.25 + Math.sin(t * 21) * 0.15;
    fireL1.intensity = Math.max(0.5, 2.5 + flick);
    fireL2.intensity = Math.max(0.3, 1.8 + flick * 0.7);

    // Thermometer animation (s4: 23-31.8s)
    if (t >= K.s4 && t < K.s4e) {
      const prog = clamp01((t - K.s4) / (K.s4e - K.s4));
      thermoH = prog * 2.6;
      thermoFill.scale.y = Math.max(0.01, thermoH / 0.1);
      thermoFill.position.y = 3.6 + thermoH * 0.5;
      thermoFill.material.color.setHex(prog > 0.7 ? P.fire1 : P.warn);
    }

    // Fire particles (s1, s4 zones)
    const fp = firePts.pos;
    for (let i = 0; i < 180; i++) {
      const zone = i < 90 ? 0 : 54;
      const age = ((t * 1.3 + i * 0.37) % 2.5) / 2.5;
      fp[i * 3] = zone + (rnd() - 0.5) * 3;
      fp[i * 3 + 1] = age * 6 + rnd() * 0.3;
      fp[i * 3 + 2] = (rnd() - 0.5) * 3 + 0.5;
    }
    firePts.commit();
    firePts.P.visible = (t < K.s5e);

    // Water particles (s5, s8 zones)
    const wp = waterPts.pos;
    const waterActive = t >= K.s5 && t < K.outro;
    waterPts.P.visible = waterActive;
    if (waterActive) {
      for (let i = 0; i < 250; i++) {
        const zone = i < 150 ? 72 : 126;
        const age = ((t * 2 + i * 0.19) % 1.8) / 1.8;
        const ang = rnd() * Math.PI * 2;
        const rad = age * 2.5;
        wp[i * 3] = zone + Math.cos(ang) * rad;
        wp[i * 3 + 1] = 8.5 - age * 6;
        wp[i * 3 + 2] = Math.sin(ang) * rad;
      }
      waterPts.commit();
    }

    // Smoke particles (visible during fire scenes)
    const sp = smokePts.pos;
    smokePts.P.visible = (t < K.s6);
    for (let i = 0; i < 100; i++) {
      const zone = i < 50 ? 0 : 54;
      const age = ((t * 0.6 + i * 0.51) % 4) / 4;
      sp[i * 3] = zone + (rnd() - 0.5) * 5;
      sp[i * 3 + 1] = 4 + age * 8;
      sp[i * 3 + 2] = (rnd() - 0.5) * 4;
    }
    smokePts.commit();

    // Water cone visibility
    waterCone.visible = t >= K.s5;
    waterCone8.visible = t >= K.s8;

    comp.render();
  };
}
