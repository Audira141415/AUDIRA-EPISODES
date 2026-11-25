// EP19 — Dispenser Galon Bawah · NANOFORGE
import * as THREE from "./three.module.js";
import { stage, track, std, box, cyl, canvasTex, pts, envStrips, label, mulberry, clamp01, ramp, eout } from "./lib3d.js";

const P = {
  bg: 0x06091a, fog: 0x06091a,
  navy: 0x0a0e2e, deepBlue: 0x0d1b3e,
  cyan: 0x00e5ff, teal: 0x00bcd4, aqua: 0x26c6da,
  green: 0x00e676, lime: 0xa3e635,
  hot: 0xff6d00, warmRed: 0xff3d00,
  cold: 0x448aff, ice: 0x82b1ff,
  white: 0xe0e0e0, steel: 0x78909c,
  glow: 0x00ffcc, dim: 0x1a237e,
  grid: 0x0d47a1
};

const mat = (c, r = 0.4, m = 0) => std(c, r, m);
const glow = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.2, metalness: 0.1, emissive: c, emissiveIntensity: 0.35 });
const glass = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.05, metalness: 0.05, transmission: 0.6, thickness: 0.3, ior: 1.4, transparent: true, opacity: 0.55 });
const wire = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.7, wireframe: true });

function gridFloor(scene) {
  const tx = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#06091a";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#0d47a180";
    g.lineWidth = 1;
    for (let i = 0; i <= 16; i++) {
      const p = (i / 16) * w;
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke();
      g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke();
    }
  }, [8, 8]);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9, metalness: 0 }));
  fl.rotation.x = -Math.PI / 2; fl.position.y = -0.05; fl.receiveShadow = true;
  scene.add(fl);
}

function dispenserBody(scene) {
  const G = new THREE.Group();
  // outer shell — translucent
  const shell = new THREE.Mesh(new THREE.BoxGeometry(4.5, 10, 3.2), glass(P.deepBlue));
  shell.position.y = 5; G.add(shell);
  // bottom compartment door
  const door = new THREE.Mesh(new THREE.BoxGeometry(4.3, 3.8, 0.12), mat(P.navy, 0.5, 0.3));
  door.position.set(0, 2, 1.6); G.add(door);
  // top panel
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 3.3), mat(P.steel, 0.35, 0.5));
  top.position.y = 10.15; top.castShadow = true; G.add(top);
  // faucet area
  const faucetPlate = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.15), mat(P.steel, 0.3, 0.6));
  faucetPlate.position.set(0, 8.2, 1.58); G.add(faucetPlate);
  // hot faucet (red)
  const fH = cyl(0.12, 0.12, 0.5, 12, glow(P.hot), -1, 8.2, 1.8, G);
  // cold faucet (blue)
  const fC = cyl(0.12, 0.12, 0.5, 12, glow(P.cold), 1, 8.2, 1.8, G);
  // drip tray
  box(3, 0.15, 1.2, mat(P.dim, 0.6), 0, 7.1, 1.3, G);
  scene.add(G);
  return { G, shell, door, fH, fC };
}

function galon(scene, y) {
  const G = new THREE.Group();
  // bottle body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.2, 16), glass(P.teal));
  body.position.y = 1.6; G.add(body);
  // neck
  cyl(0.35, 0.35, 0.6, 12, glass(P.cyan), 0, 3.5, 0, G);
  // cap
  cyl(0.38, 0.38, 0.2, 12, mat(P.aqua, 0.3, 0.2), 0, 3.8, 0, G);
  // water inside (slightly smaller)
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.8, 16), glow(P.cold));
  water.position.y = 1.4; water.material.transparent = true; water.material.opacity = 0.25; G.add(water);
  G.position.y = y;
  scene.add(G);
  return { G, water };
}

function pumpAssembly(scene) {
  const G = new THREE.Group();
  // pump housing
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16), mat(P.steel, 0.3, 0.7));
  housing.position.y = 4.5; G.add(housing);
  // pump glow ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 24), glow(P.cyan));
  ring.position.y = 4.5; ring.rotation.x = Math.PI / 2; G.add(ring);
  // suction pipe (down to galon)
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8), glow(P.teal));
  pipe.position.y = 2.4; G.add(pipe);
  // delivery pipe (up to tank)
  const pipeUp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5, 8), glow(P.green));
  pipeUp.position.y = 6.8; G.add(pipeUp);
  scene.add(G);
  return { G, ring, housing };
}

function tankArea(scene) {
  const G = new THREE.Group();
  // main reservoir tank
  const reservoir = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 2), glass(P.cyan));
  reservoir.position.set(0, 8.8, 0); G.add(reservoir);
  // float mechanism
  const floatBall = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), glow(P.green));
  floatBall.position.set(0.8, 9.2, 0); G.add(floatBall);
  const floatArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), mat(P.steel, 0.3, 0.6));
  floatArm.position.set(0.4, 9.2, 0); floatArm.rotation.z = Math.PI / 2; G.add(floatArm);
  // hot tank (right)
  const hotTank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 12), glass(P.hot));
  hotTank.position.set(1.6, 7, 0); G.add(hotTank);
  // heating element coil
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20), glow(P.warmRed));
  coil.position.set(1.6, 6.5, 0); coil.rotation.x = Math.PI / 2; G.add(coil);
  // cold tank (left)
  const coldTank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 12), glass(P.cold));
  coldTank.position.set(-1.6, 7, 0); G.add(coldTank);
  // peltier module
  const peltier = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), glow(P.ice));
  peltier.position.set(-1.6, 6.0, 0); G.add(peltier);
  // heatsink fins
  for (let i = 0; i < 5; i++) {
    box(0.9, 0.04, 0.6, mat(P.steel, 0.3, 0.7), -1.6, 5.55 - i * 0.12, 0, G);
  }
  scene.add(G);
  return { G, floatBall, floatArm, reservoir, hotTank, coldTank, coil, peltier };
}

function nanoParticles(scene) {
  const water = pts(scene, 200, { color: P.cyan, size: 0.18, opacity: 0.5 });
  const heat = pts(scene, 80, { color: P.hot, size: 0.15, opacity: 0.4 });
  const cold = pts(scene, 80, { color: P.cold, size: 0.15, opacity: 0.4 });
  return { water, heat, cold };
}

function audiraLabel(scene) {
  const lb = label("AUDIRA", { w: 512, h: 96, font: "700 56px sans-serif", color: "#00e5ff", bg: "#0a0e2e", size: 3 });
  lb.position.set(0, 10.6, 1.7);
  scene.add(lb);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, {
    bg: P.bg, fog: 0.012, exp: 1.0,
    bloom: [0.6, 0.5, 0.75], fov: 38, shadow: true
  });

  envStrips(r, scene, [
    [20, 6, P.cyan, 0.3, 0, 12, -18],
    [14, 4, P.teal, 0.25, -12, 8, -10],
    [14, 4, P.cold, 0.2, 12, 8, -10],
    [18, 3, P.green, 0.15, 0, 3, 18]
  ], 0x020418);

  gridFloor(scene);

  const amb = new THREE.AmbientLight(0x1a237e, 0.5);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xb0bec5, 1.2);
  dir.position.set(6, 14, 8); dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.left = -12; dir.shadow.camera.right = 12;
  dir.shadow.camera.top = 14; dir.shadow.camera.bottom = -2;
  scene.add(dir);
  const rim = new THREE.DirectionalLight(P.cyan, 0.4);
  rim.position.set(-8, 10, -6); scene.add(rim);
  const spot = new THREE.PointLight(P.green, 0.6, 20);
  spot.position.set(0, 6, 4); scene.add(spot);

  const disp = dispenserBody(scene);
  const gal = galon(scene, 0.3);
  const pump = pumpAssembly(scene);
  const tanks = tankArea(scene);
  const nano = nanoParticles(scene);
  audiraLabel(scene);

  const rng = mulberry(1919);

  const cam0 = track([
    [0,    6, 7, 14],
    [K.s1, 4, 6, 12],
    [K.s2, 2, 8, 11],
    [K.s3, 1, 3, 8],
    [K.s4, 0.5, 5, 7],
    [K.s5, 0, 9, 6],
    [K.s6, -1, 7, 5],
    [K.s6e, 1.5, 6.5, 6],
    [K.s7, 0, 7, 9],
    [K.s8, 3, 6, 13],
    [K.end, 5, 7, 14]
  ]);

  const look0 = track([
    [0,    0, 5.5, 0],
    [K.s2, 0, 5, 0],
    [K.s3, 0, 2, 0],
    [K.s4, 0, 5, 0],
    [K.s5, 0, 9, 0],
    [K.s6, -1.6, 7, 0],
    [K.s6e, 1.6, 7, 0],
    [K.s7, 0, 7, 0],
    [K.s8, 0, 5, 0],
    [K.end, 0, 5, 0]
  ]);

  return function draw(t) {
    const cp = cam0(t);
    cam.position.set(cp[0], cp[1], cp[2]);
    const lp = look0(t);
    cam.lookAt(lp[0], lp[1], lp[2]);

    // float ball bob with scene timing
    const floatPhase = t > K.s5 && t < K.s5e
      ? 0.5 + 0.4 * Math.sin((t - K.s5) * 2.5)
      : 0.3;
    tanks.floatBall.position.y = 8.8 + floatPhase;

    // pump ring pulse
    const pumpGlow = 0.3 + 0.15 * Math.sin(t * 6);
    pump.ring.material.emissiveIntensity = pumpGlow;

    // heating coil pulse
    const heatPulse = t > K.s6 ? 0.35 + 0.2 * Math.sin(t * 4) : 0.15;
    tanks.coil.material.emissiveIntensity = heatPulse;

    // peltier glow
    const peltierPulse = t > K.s6 ? 0.4 + 0.15 * Math.sin(t * 3 + 1) : 0.1;
    tanks.peltier.material.emissiveIntensity = peltierPulse;

    // water nano particles — flowing upward through pipe region
    for (let i = 0; i < 200; i++) {
      const phase = (t * 0.8 + i * 0.037) % 1;
      const spread = rng() * 0.6 - 0.3;
      nano.water.pos[i * 3] = spread + Math.sin(i * 0.5 + t) * 0.15;
      nano.water.pos[i * 3 + 1] = phase * 10;
      nano.water.pos[i * 3 + 2] = spread + Math.cos(i * 0.7 + t) * 0.15;
    }
    nano.water.commit();

    // heat particles — around hot tank
    for (let i = 0; i < 80; i++) {
      const phase = (t * 0.5 + i * 0.05) % 1;
      nano.heat.pos[i * 3] = 1.6 + Math.sin(i + t * 2) * 0.8;
      nano.heat.pos[i * 3 + 1] = 6 + phase * 2.5;
      nano.heat.pos[i * 3 + 2] = Math.cos(i * 1.3 + t * 1.5) * 0.8;
    }
    nano.heat.commit();

    // cold particles — around cold tank
    for (let i = 0; i < 80; i++) {
      const phase = (t * 0.4 + i * 0.05) % 1;
      nano.cold.pos[i * 3] = -1.6 + Math.sin(i * 0.9 + t * 1.8) * 0.8;
      nano.cold.pos[i * 3 + 1] = 5.5 + phase * 2.5;
      nano.cold.pos[i * 3 + 2] = Math.cos(i * 1.1 + t * 1.3) * 0.8;
    }
    nano.cold.commit();

    // shell transparency pulsing
    disp.shell.material.opacity = 0.35 + 0.1 * Math.sin(t * 1.5);

    // NaN guard
    const p = cam.position;
    if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
      cam.position.set(4, 7, 12);
      cam.lookAt(0, 5, 0);
    }

    comp.render();
  };
}
