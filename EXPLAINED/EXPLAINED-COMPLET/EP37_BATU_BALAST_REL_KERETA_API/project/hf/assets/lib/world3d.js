// EP37 BATU BALAS (INNERWORKS): cross-section diorama of railway track on a polished-concrete studio plinth.
//   PLINTH  a low block (x -6..6, y 0, z -4..4) holding the terrain layers, with a cutaway face showing strata
//   LAYERS  top to bottom: ballast (angular stones), sub-ballast, subgrade (earth). Cut face shows each band
//   TRACK   two steel I-beam rails on concrete sleepers (bantalan), fastened with clips
//   HOOK    camera starts above the track, slow dolly to reveal the cross-section (s1)
//   s2-s3   name plate "BATU BALAS", spec callout with a ruler showing 2.5–6 cm
//   s4      force arrows: wheel→rail→sleeper→stones→ground, spreading cone glows
//   s5      angular vs round: left side = angular (locked), right side = round pebbles (tumble)
//   s6      expansion: rail glows orange, shoulder ballast glows; rain particles fall through gaps
//   s7      tamping machine silhouette lifts rail, vibrating tines push stones under sleeper
//   s8      pull-back, entire diorama glows once as "fondasi yang bisa disetel"
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, box, cyl, std } from "./lib3d.js";

const SANS = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(.299,.587,.114));c+=vec3(-.01,.015,.025)*(1.0-l);c=(c-.5)*1.05+.5;c=mix(c,vec3(.95,.82,.55),flash*.6);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const hdr = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: true });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function textTex(w, h, draw) { return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); draw(g, w, h); }); }
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
function plane(tex, w, h, parent, x, y, z, o = {}) {
  const mat = o.basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color(o.tint || 0xffffff).multiplyScalar(o.k || 1), side: THREE.DoubleSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending })
    : new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.renderOrder = 3; if (parent) parent.add(m); return m;
}
function hudLabel(lines, w, parent, x, y, z, col = "#0F6E73") {
  const H = 150 * lines.length + 40, tex = textTex(1024, H, (g, W, Hh) => {
    g.fillStyle = "rgba(246,241,231,.92)"; const r = 14; g.beginPath(); g.roundRect(8, 8, W - 16, Hh - 16, r); g.fill();
    g.fillStyle = "#F07B2D"; g.fillRect(8, 8, 10, Hh - 16);
    lines.forEach((s, i) => txt(g, s, W / 2 + 5, 20 + 75 + i * 150, `900 ${i ? 88 : 108}px ${SANS}`, i ? "#14202B" : col));
  });
  const m = plane(tex, w, (w * H) / 1024, parent, x, y, z, { basic: true, k: 1 }); m.renderOrder = 6; return m;
}

// angular ballast stone: random-ish polyhedron with sharp edges
function ballastStone(R, parent, x, y, z, s, mat) {
  const base = 0.08 + R() * 0.08, h = 0.06 + R() * 0.06;
  const g = new THREE.DodecahedronGeometry(base, 0);
  g.scale(0.8 + R() * 0.4, 0.6 + R() * 0.5, 0.7 + R() * 0.5);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.scale.setScalar(s);
  m.rotation.set(R() * 6, R() * 6, R() * 6); m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m); return m;
}
function roundPebble(R, parent, x, y, z, s, mat) {
  const g = new THREE.SphereGeometry(0.07 + R() * 0.04, 10, 8);
  g.scale(1, 0.7 + R() * 0.3, 0.8 + R() * 0.3);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.scale.setScalar(s);
  m.rotation.set(R() * 6, R() * 6, R() * 6); m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m); return m;
}

// I-beam rail profile
function railBeam(len, mat, parent, x, y, z) {
  const G = new THREE.Group(); G.position.set(x, y, z); if (parent) parent.add(G);
  box(0.12, 0.18, len, mat, 0, 0, 0, G);           // web
  box(0.22, 0.04, len, mat, 0, 0.09, 0, G);         // head
  box(0.26, 0.04, len, mat, 0, -0.09, 0, G);        // foot
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x10262a, fog: 0.025, exp: 1.0, bloom: [0.4, 0.5, 0.75] });
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  { // env
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x0f2225);
    for (const [w, h, c, i, x, y, z] of [[10, 4, 0xd8c8a8, 0.6, 0, 5, 0], [8, 3, 0x4a8a7a, 0.4, 4, 0, 3], [6, 3, 0x1a3030, 0.3, -4, -2, 0]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const hemi = new THREE.HemisphereLight(0xe8dac8, 0x1a2a22, 1.2); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0d8, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(0xa8d8cc, 0.8); scene.add(fill); scene.add(fill.target);

  // ======== PLINTH (studio base) ========
  const PLINTH = new THREE.Group(); scene.add(PLINTH);
  const plinthMat = std("#8a9090", 0.75, 0.1);
  box(12, 0.5, 8, plinthMat, 0, -0.25, 0, PLINTH);
  // cut face texture: stripes showing earth layers
  const cutTex = textTex(512, 512, (g, w, h) => {
    g.fillStyle = "#6b5e4a"; g.fillRect(0, 0, w, h);       // earth
    g.fillStyle = "#8a7e6a"; g.fillRect(0, 0, w, h * 0.35); // sub-ballast
    g.fillStyle = "#a09484"; g.fillRect(0, 0, w, h * 0.15); // ballast band hint
    const R = mulberry(37);
    for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "40,35,25" : "140,130,110"},.3)`; g.fillRect(R() * w, R() * h, 3 + R() * 8, 1 + R() * 3); }
    g.fillStyle = "#3a5550"; g.fillRect(0, h * 0.9, w, h * 0.1); // subgrade
  });
  const cutFace = mesh(new THREE.PlaneGeometry(12, 3.5), new THREE.MeshStandardMaterial({ map: cutTex, roughness: 0.85 }), PLINTH, 0, 1.5, 4.01);

  // ======== TERRAIN LAYERS ========
  const TERRAIN = new THREE.Group(); PLINTH.add(TERRAIN);
  const earthMat = std("#6b5e4a", 0.9, 0);
  const subBallastMat = std("#8a7e6a", 0.85, 0);
  box(11.5, 1.0, 7.5, earthMat, 0, 0.5, 0, TERRAIN);         // subgrade + earth
  box(11.5, 0.6, 7.5, subBallastMat, 0, 1.3, 0, TERRAIN);    // sub-ballast
  // ballast layer: many angular stones
  const BALLAST = new THREE.Group(); TERRAIN.add(BALLAST);
  const stoneMats = [std("#9a9088", 0.7, 0.05), std("#807870", 0.72, 0.05), std("#b0a898", 0.68, 0.05), std("#706860", 0.75, 0.05)];
  const R = mulberry(37);
  const stones = [];
  for (let i = 0; i < 280; i++) {
    const x = -5 + R() * 10, z = -3.2 + R() * 6.4, y = 1.62 + R() * 0.35;
    const s = 0.7 + R() * 0.6;
    stones.push(ballastStone(R, BALLAST, x, y, z, s, stoneMats[Math.floor(R() * 4)]));
  }
  // shoulder ballast (the mounds at sleeper ends that resist lateral movement)
  for (let i = 0; i < 60; i++) {
    const side = R() < 0.5 ? -1 : 1;
    const x = -4 + R() * 8, z = side * (2.8 + R() * 0.8), y = 1.8 + R() * 0.4;
    ballastStone(R, BALLAST, x, y, z, 0.6 + R() * 0.5, stoneMats[Math.floor(R() * 4)]);
  }

  // ======== SLEEPERS (bantalan beton) ========
  const sleeperMat = std("#c8c0b0", 0.82, 0.05);
  const sleepers = [];
  for (let i = 0; i < 9; i++) {
    const sl = box(0.32, 0.22, 5.0, sleeperMat, -4 + i * 1.0, 2.02, 0, PLINTH);
    sleepers.push(sl);
  }

  // ======== RAILS ========
  const railMat = std("#5a5856", 0.4, 0.85);
  const railL = railBeam(10, railMat, PLINTH, 0, 2.22, -0.75);
  const railR = railBeam(10, railMat, PLINTH, 0, 2.22, 0.75);
  // rail clips (small orange clips on each sleeper)
  const clipMat = std("#e08030", 0.4, 0.6);
  sleepers.forEach((sl) => {
    for (const zz of [-0.75, 0.75]) {
      const c = mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 8, Math.PI), clipMat, PLINTH, sl.position.x, 2.16, zz);
      c.rotation.x = Math.PI / 2;
    }
  });

  // ======== ROUND PEBBLES (contrast for s5) ========
  const PEBBLES = new THREE.Group(); scene.add(PEBBLES);
  const pebbleMat = std("#b8b0a0", 0.5, 0.1);
  const pebbles = [];
  for (let i = 0; i < 40; i++) {
    const x = 4.5 + R() * 2.5, z = -1.5 + R() * 3, y = 1.7 + R() * 0.3;
    pebbles.push(roundPebble(R, PEBBLES, x, y, z, 0.6 + R() * 0.4, pebbleMat));
  }
  PEBBLES.visible = false;

  // ======== FORCE ARROWS (s4) ========
  const arrowMat = hdr(0xf07b2d, 2.5);
  const arrows = new THREE.Group(); scene.add(arrows); arrows.visible = false;
  const arrowShape = () => { const g = new THREE.ConeGeometry(0.12, 0.35, 8); return g; };
  const arrowStem = () => new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
  for (let i = 0; i < 4; i++) {
    const y0 = 3.8 - i * 0.55; const spread = 0.15 * i;
    const G = new THREE.Group(); G.position.set(0, y0, 0); arrows.add(G);
    mesh(arrowStem(), arrowMat, G, 0, -0.3, 0);
    mesh(arrowShape(), arrowMat, G, 0, -0.78, 0);
    if (i > 1) { // spread arrows for the ballast layer
      for (const s of [-1, 1]) {
        const G2 = new THREE.Group(); G2.position.set(s * spread, y0 - 0.2, 0); G2.rotation.z = s * 0.4; arrows.add(G2);
        mesh(arrowStem(), arrowMat, G2, 0, -0.2, 0);
        mesh(arrowShape(), arrowMat, G2, 0, -0.58, 0);
      }
    }
  }
  // spreading cone glow (additive plane)
  const coneTex = textTex(256, 512, (g) => {
    const gr = g.createLinearGradient(128, 0, 128, 512);
    gr.addColorStop(0, "rgba(240,123,45,.6)"); gr.addColorStop(1, "rgba(240,123,45,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(110, 0); g.lineTo(20, 512); g.lineTo(236, 512); g.closePath(); g.fill();
  });
  const cone = plane(coneTex, 3, 3.5, arrows, 0, 1.5, 0.1, { basic: true, add: true, k: 1 });

  // ======== TAMPING MACHINE (s7) — simplified silhouette ========
  const TAMPER = new THREE.Group(); scene.add(TAMPER); TAMPER.visible = false;
  const tampMat = std("#e8a030", 0.5, 0.6);
  const tampBody = box(2.0, 1.0, 1.2, tampMat, 0, 4.2, 0, TAMPER);
  box(0.3, 0.5, 0.6, std("#4a4a4a", 0.6, 0.4), 0, 4.8, 0, TAMPER); // cab
  const tines = [];
  for (let i = 0; i < 4; i++) {
    const t = cyl(0.03, 0.03, 1.2, 6, std("#c0c0c0", 0.3, 0.8), -0.4 + i * 0.27, 3.1, 0, TAMPER);
    tines.push(t);
  }
  // lift arms
  cyl(0.05, 0.05, 1.5, 6, tampMat, -0.8, 3.6, 0, TAMPER).rotation.z = 0.3;
  cyl(0.05, 0.05, 1.5, 6, tampMat, 0.8, 3.6, 0, TAMPER).rotation.z = -0.3;

  // ======== RAIN PARTICLES (s6) ========
  const NR = 400, rainPos = new Float32Array(NR * 3);
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x8ac8e0, size: 0.02, transparent: true, opacity: 0, depthWrite: false }));
  rain.frustumCulled = false; scene.add(rain);
  const rainBase = []; { const RR = mulberry(99); for (let i = 0; i < NR; i++) rainBase.push([RR() * 10 - 5, RR() * 6, RR() * 6 - 3, RR()]); }

  // ======== WHEEL (s4) ========
  const WHEEL = new THREE.Group(); scene.add(WHEEL); WHEEL.visible = false;
  const wheelMat = std("#4a4a4a", 0.4, 0.85);
  mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 24).rotateX(Math.PI / 2), wheelMat, WHEEL, 0, 3.4, 0);
  mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8).rotateX(Math.PI / 2), wheelMat, WHEEL, 0, 3.4, 0); // axle
  mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 24), wheelMat, WHEEL, 0, 3.4, -0.18); // flange

  // ======== HUD LABELS ========
  const labBalas = hudLabel(["BATU BALAS"], 1.4, scene, 0, 3.2, 2.5);
  const labSpec = hudLabel(["2,5 – 6 CM", "BERSUDUT TAJAM"], 1.3, scene, 2.5, 2.8, 2.5);
  const lab30 = hudLabel(["30 CM"], 0.9, scene, -3.5, 1.5, 3.5);
  const labLock = hudLabel(["SALING MENGUNCI"], 1.3, scene, -2, 2.8, 3.5);
  const labTamp = hudLabel(["MESIN PEMADAT"], 1.2, scene, 1.5, 5.0, 1.5);

  // ======== CAMERA ========
  const s = (k) => K[k];
  const cam1 = track([
    [0, 0, 5.5, 8, 0, 2, 0],
    [s("s2") - 0.5, -1, 4.2, 7, 0, 1.8, 0],
    [s("s2") + 1.0, 1.5, 3.5, 6, 0, 1.6, 0.5],
    [s("s3") + 0.5, 2.5, 3.0, 5.5, 1, 1.8, 0],
    [A("s3:tajam") + 0.3, 1.5, 2.8, 4.5, 0.5, 1.9, 0.2],
    [s("s4") - 0.3, 0, 4.2, 6.5, 0, 2.5, 0],
    [A("s4:Roda"), 0, 4.8, 5.5, 0, 2.8, 0],
    [A("s4:tanah"), -0.5, 3.0, 6.5, 0, 1.2, 0],
    [s("s5") - 0.3, 2.5, 3.2, 5, 2, 1.9, 0],
    [A("s5:mencengkeram"), 0.5, 2.6, 4.2, 0, 1.9, -0.3],
    [A("s5:bulat"), 5, 3.0, 5, 5, 1.9, 0],
    [A("s5:kelereng"), 5.5, 2.8, 4.5, 5, 1.8, 0],
    [s("s6") - 0.3, 0.5, 3.5, 5.5, 0, 2.2, 0],
    [A("s6:memuai"), 1, 3.2, 5, 0, 2.2, 0],
    [A("s6:hujan"), -1.5, 3.8, 6, -1, 1.8, 0],
    [s("s7") - 0.3, 0, 4.5, 7, 0, 3, 0],
    [A("s7:pemadat"), 0, 5.5, 6, 0, 3.5, 0],
    [A("s7:rata"), -0.5, 4.0, 6.5, 0, 2.5, 0],
    [s("s8") - 0.2, -2, 5, 10, 0, 2, 0],
    [A("s8:fondasi"), -3, 5.5, 11, 0, 1.8, 0],
    [s("end"), -4, 6.5, 13, 0, 1.5, 0],
  ]);

  return (t) => {
    const [cx, cy, cz, lx, ly, lz] = cam1(t);
    cam.position.set(cx + 0.03 * Math.sin(t * 0.7), cy + 0.02 * Math.sin(t * 0.9), cz);
    cam.lookAt(lx, ly, lz);
    key.position.set(cx - 3, 12, 8); key.target.position.set(lx, ly, lz);
    fill.position.set(cx + 5, cy + 2, cz + 6); fill.target.position.set(lx, ly, lz);

    // hook: rail wobble on "amblas"
    const wobble = ramp(t, A("s1:amblas") - 0.2, A("s1:amblas") + 0.3) * (1 - ramp(t, A("s1:melengkung") + 0.5, A("s1:melengkung") + 1.2));
    railL.rotation.z = 0.015 * Math.sin(t * 8) * wobble;
    railR.rotation.z = -0.01 * Math.sin(t * 9 + 1) * wobble;

    // s2: name label
    labBalas.material.opacity = ramp(t, A("s2:balas") - 0.3, A("s2:balas") + 0.2) * (1 - ramp(t, s("s3") - 0.4, s("s3")));

    // s3: spec label
    labSpec.material.opacity = ramp(t, A("s3:pecah") - 0.3, A("s3:pecah") + 0.2) * (1 - ramp(t, s("s4") - 0.4, s("s4")));

    // s4: force arrows, wheel
    const force = ramp(t, A("s4:Roda") - 0.3, A("s4:Roda") + 0.5) * (1 - ramp(t, s("s5") - 0.5, s("s5")));
    arrows.visible = force > 0.01;
    arrows.children.forEach((c) => { if (c.material) c.material.opacity = force; });
    cone.material.opacity = force * 0.5 * (0.7 + 0.3 * Math.sin(t * 4));
    WHEEL.visible = force > 0.01;
    WHEEL.children.forEach((c) => c.rotation.x = t * 2);
    lab30.material.opacity = ramp(t, A("s4:tanah") - 0.4, A("s4:tanah")) * (1 - ramp(t, s("s5") - 0.4, s("s5")));

    // s5: angular vs round
    const pebbleShow = ramp(t, A("s5:bulat") - 0.5, A("s5:bulat") + 0.3) * (1 - ramp(t, s("s6") - 0.5, s("s6")));
    PEBBLES.visible = pebbleShow > 0.01;
    PEBBLES.children.forEach((p, i) => {
      p.scale.setScalar(Math.max(0.001, pebbleShow * (0.5 + 0.3 * Math.sin(i))));
      if (pebbleShow > 0.3) p.rotation.x += 0.01 * Math.sin(t * 2 + i); // tumble
    });
    labLock.material.opacity = ramp(t, A("s5:mencengkeram") - 0.3, A("s5:mencengkeram") + 0.2) * (1 - ramp(t, s("s6") - 0.4, s("s6")));

    // s6: rail expansion (glow orange), rain
    const heat = ramp(t, A("s6:memuai") - 0.3, A("s6:memuai") + 0.5) * (1 - ramp(t, A("s6:hujan") - 0.3, A("s6:hujan")));
    railMat.emissive.setHex(0xff6020);
    railMat.emissiveIntensity = 0.6 * heat;
    railL.scale.z = 1 + 0.008 * heat; railR.scale.z = 1 + 0.008 * heat;
    const rainAmt = ramp(t, A("s6:hujan") - 0.5, A("s6:hujan") + 0.3) * (1 - ramp(t, s("s7") - 0.5, s("s7")));
    rain.material.opacity = 0.6 * rainAmt;
    for (let i = 0; i < NR; i++) {
      const b = rainBase[i]; const y = ((b[1] - t * 3 * (0.5 + b[3])) % 6 + 6) % 6 - 1 + 1.5;
      rainPos[i * 3] = b[0]; rainPos[i * 3 + 1] = y; rainPos[i * 3 + 2] = b[2];
    }
    rainGeo.attributes.position.needsUpdate = true;

    // s7: tamping machine
    const tamp = ramp(t, A("s7:pemadat") - 0.5, A("s7:pemadat") + 0.3) * (1 - ramp(t, s("s8") - 0.5, s("s8")));
    TAMPER.visible = tamp > 0.01;
    TAMPER.scale.setScalar(Math.max(0.001, eout(tamp)));
    const lift = ramp(t, A("s7:mengangkat") - 0.2, A("s7:mengangkat") + 0.5);
    TAMPER.position.y = 0.3 * lift;
    tines.forEach((tn, i) => { tn.position.y = 3.1 - 0.3 * lift + 0.02 * Math.sin(t * 30 + i * 2) * tamp; });
    labTamp.material.opacity = tamp;

    // s8: glow all
    const glow = ramp(t, A("s8:fondasi") - 0.3, A("s8:fondasi") + 0.3) * (1 - ramp(t, s("outro") - 0.5, s("outro")));
    gradeP.uniforms.flash.value = 0.15 * glow;

    comp.render();
  };
}
