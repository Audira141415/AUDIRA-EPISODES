// EP38 TETRAPOD (BRUTALFORGE): a coastal breakwater made of interlocking tetrapod blocks. Harsh directional light,
// deep shadows, rough concrete surfaces. Camera orbits the wall, then goes inside the gaps to show wave energy
// dissipating among the rough legs.
//   WALL     a slope of tetrapods (two layers, ~20 blocks) facing the sea
//   SEA      flat ocean plane with animated normals; wave particles rush in (s6)
//   FLAT     a flat concrete seawall (s3) to show what DOESN'T work — reflected wave
//   CROSS    cutaway of one tetrapod showing the 4-leg geometry + low center of gravity marker (s6)
//   HUDSON   a scale comparison: 2x wave height = 8x block weight (s7)
//   s1 hook: camera high, looking down at the tetrapod field; one wave crashes
//   s2: overhead, "tetrapod" label, Danel portrait silhouette
//   s3: flat wall, wave hits and bounces back (arrow)
//   s4: two layers, kaki saling mengait, no cement
//   s5: camera inside the gaps, "50% ruang kosong" label
//   s6: wave rushes in, water particles scatter, energy arrows shrink, low CoG marker
//   s7: scale blocks (small vs big), Hudson formula callout
//   s8: pull-back, golden-hour light, "menang dengan menjebak"
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, box, cyl, std } from "./lib3d.js";

const SANS = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 }, warm: { value: 0 } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;uniform float warm;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(.299,.587,.114));c=(c-.5)*1.08+.5;c=mix(c,vec3(.95,.85,.65),warm*.18);c=mix(c,vec3(.7,.85,1.0),flash*.4);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const hdr = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: true });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function textTex(w, h, draw) { return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); draw(g, w, h); }); }
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
function plane(tex, w, h, parent, x, y, z, o = {}) {
  const mat = o.basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color(o.tint || 0xffffff).multiplyScalar(o.k || 1), side: THREE.DoubleSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending })
    : new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.renderOrder = 3; if (parent) parent.add(m); return m;
}
function hudLabel(lines, w, parent, x, y, z, col = "#2A7FCC") {
  const H = 150 * lines.length + 40, tex = textTex(1024, H, (g, W, Hh) => {
    g.fillStyle = "rgba(26,28,30,.9)"; g.fillRect(8, 8, W - 16, Hh - 16);
    g.fillStyle = col; g.fillRect(8, 8, 10, Hh - 16);
    lines.forEach((s, i) => txt(g, s, W / 2 + 5, 20 + 75 + i * 150, `900 ${i ? 88 : 108}px ${SANS}`, i ? "#f0efed" : col));
  });
  const m = plane(tex, w, (w * H) / 1024, parent, x, y, z, { basic: true, k: 1 }); m.renderOrder = 6; return m;
}

// tetrapod: 4 cylindrical legs radiating from center at tetrahedral angles
function tetrapod(mat, parent, x, y, z, scale = 1, seed = 0) {
  const G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(scale); if (parent) parent.add(G);
  const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.1, 10);
  const capGeo = new THREE.SphereGeometry(0.22, 12, 10);
  mesh(new THREE.SphereGeometry(0.28, 14, 12), mat, G, 0, 0, 0); // core
  const dirs = [[0, 1, 0], [0.943, -0.333, 0], [-0.471, -0.333, 0.816], [-0.471, -0.333, -0.816]];
  dirs.forEach(([dx, dy, dz]) => {
    const leg = new THREE.Group(); G.add(leg);
    const c = mesh(legGeo, mat, leg, 0, 0.55, 0);
    mesh(capGeo, mat, leg, 0, 1.1, 0); // end bulb
    leg.lookAt(new THREE.Vector3(dx, dy, dz).multiplyScalar(10));
  });
  const R = mulberry(seed);
  G.rotation.set(R() * 0.4 - 0.2, R() * 6.28, R() * 0.3 - 0.15);
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x1a1c1e, fog: 0.02, exp: 1.05, bloom: [0.35, 0.5, 0.72] });
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  { const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x242628);
    for (const [w, h, c, i, x, y, z] of [[12, 5, 0xaec8e0, 0.5, 0, 6, 0], [8, 4, 0x4a6070, 0.3, 5, -2, 4]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.4;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const hemi = new THREE.HemisphereLight(0xc8d8e8, 0x1a2028, 1.0); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0d8, 3.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(0x8ab0d0, 0.7); scene.add(fill); scene.add(fill.target);

  // ======== CONCRETE MATERIALS ========
  const concMat = std("#888884", 0.92, 0.02);
  const concDark = std("#5a5856", 0.9, 0.02);
  const concWet = std("#606060", 0.6, 0.05);

  // ======== TETRAPOD WALL (slope of ~22 blocks) ========
  const WALL = new THREE.Group(); scene.add(WALL);
  const R = mulberry(38);
  const pods = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const x = -4.5 + col * 1.5 + (R() - 0.5) * 0.4;
      const y = 0.8 + row * 1.3 + (R() - 0.5) * 0.3;
      const z = -row * 1.8 + (R() - 0.5) * 0.3;
      const p = tetrapod(row < 2 ? concMat : concDark, WALL, x, y, z, 0.55 + R() * 0.15, 100 + row * 10 + col);
      pods.push(p);
    }
  }
  // base slope (rubble mound)
  mesh(new THREE.BoxGeometry(14, 1.5, 8), std("#5a5550", 0.95, 0.02), WALL, 0, -0.2, -2);
  const slope = mesh(new THREE.BoxGeometry(14, 3, 6), std("#6a6560", 0.9, 0.02), WALL, 0, 0.5, -4);
  slope.rotation.x = -0.35;

  // ======== OCEAN ========
  const seaTex = canvasTex(256, 256, (g) => {
    g.fillStyle = "#2a6888"; g.fillRect(0, 0, 256, 256);
    const RR = mulberry(8);
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(180,220,255,${0.1 + RR() * 0.2})`; g.lineWidth = 1 + RR() * 2; g.beginPath(); const x = RR() * 256, y = RR() * 256; g.moveTo(x, y); g.bezierCurveTo(x + 30, y - 10, x + 50, y + 10, x + 70, y); g.stroke(); }
  }, [20, 20]);
  const sea = mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x3a8aaa, map: seaTex, transparent: true, opacity: 0.85, roughness: 0.15, metalness: 0.1, emissive: new THREE.Color(0x1a5068), emissiveIntensity: 0.4, side: THREE.DoubleSide, depthWrite: false }), scene, 0, 0, 8);
  sea.rotation.x = -Math.PI / 2;

  // ======== FLAT WALL (s3) ========
  const FLAT = new THREE.Group(); scene.add(FLAT); FLAT.visible = false;
  box(10, 4, 0.8, std("#888884", 0.85, 0.02), 0, 2, 6, FLAT);
  // reflected wave arrow
  const arrowTex = textTex(512, 256, (g) => { g.fillStyle = "#FF6040"; g.beginPath(); g.moveTo(256, 30); g.lineTo(400, 128); g.lineTo(256, 226); g.closePath(); g.fill(); g.fillRect(60, 100, 200, 56); });
  const reflArrow = plane(arrowTex, 2, 1, FLAT, 0, 3.2, 6.8, { basic: true, k: 1.5 });

  // ======== WAVE PARTICLES (s6) ========
  const NW = 300, wavePos = new Float32Array(NW * 3);
  const waveGeo = new THREE.BufferGeometry(); waveGeo.setAttribute("position", new THREE.BufferAttribute(wavePos, 3));
  const wavePts = new THREE.Points(waveGeo, new THREE.PointsMaterial({ color: 0x6ac0e8, size: 0.04, transparent: true, opacity: 0, depthWrite: false }));
  wavePts.frustumCulled = false; scene.add(wavePts);
  const waveBase = []; { const WR = mulberry(66); for (let i = 0; i < NW; i++) waveBase.push([WR() * 12 - 6, WR() * 3, WR() * 4, WR()]); }

  // ======== ENERGY ARROWS (s6): incoming big, outgoing small ========
  const arrowIn = plane(textTex(512, 256, (g) => { g.fillStyle = "#2A7FCC"; g.beginPath(); g.moveTo(30, 128); g.lineTo(170, 40); g.lineTo(170, 216); g.closePath(); g.fill(); g.fillRect(170, 90, 310, 76); }), 2.5, 1.2, scene, 0, 2.5, 6, { basic: true, k: 1.5 });
  const arrowOut = plane(textTex(512, 256, (g) => { g.fillStyle = "rgba(42,127,204,.35)"; g.beginPath(); g.moveTo(480, 128); g.lineTo(380, 80); g.lineTo(380, 176); g.closePath(); g.fill(); g.fillRect(280, 104, 100, 48); }), 1.2, 0.6, scene, 0, 2.8, 8, { basic: true, k: 1 });

  // ======== SCALE BLOCKS (s7) ========
  const SCALE = new THREE.Group(); scene.add(SCALE); SCALE.visible = false;
  tetrapod(concMat, SCALE, -2, 1, 0, 0.5, 201);
  tetrapod(concMat, SCALE, 2, 2.2, 0, 1.0, 202);
  const labSmall = hudLabel(["W"], 0.5, SCALE, -2, 2.5, 1);
  const labBig = hudLabel(["8W"], 0.6, SCALE, 2, 4.5, 1);

  // ======== HUD LABELS ========
  const labTetra = hudLabel(["TETRAPOD"], 1.3, scene, 0, 4, 3);
  const lab50 = hudLabel(["~50% KOSONG"], 1.2, scene, 0, 2.5, 1.5);
  const labCoG = hudLabel(["TITIK BERAT RENDAH"], 1.4, scene, -2, 1.5, 3);
  const labHudson = hudLabel(["RUMUS HUDSON"], 1.3, scene, 0, 5, 3);

  // ======== CAMERA ========
  const s = (k) => K[k];
  const cam1 = track([
    [0, 0, 7, 12, 0, 2.5, 0],
    [s("s2") - 0.5, 2, 5.5, 8, 0, 2, 1],
    [A("s2:tetrapod"), 0, 5, 7, 0, 2.5, 0],
    [A("s2:Prancis"), 3, 4.5, 6, 1, 2, 0],
    [s("s3") - 0.3, 0, 3.5, 9, 0, 2.5, 6],
    [A("s3:memantulkannya"), 0, 4, 10, 0, 2.8, 6],
    [s("s4") - 0.3, -2, 3.5, 5, -1, 2, 0],
    [A("s4:terkunci"), 0, 2.8, 3.5, 0, 1.8, 0],
    [s("s5") - 0.3, 1.5, 1.8, 2.0, 0.5, 1.5, 0],
    [A("s5:separuh"), 0.5, 2.0, 1.5, 0, 1.5, -0.5],
    [s("s6") - 0.3, -1.5, 3.5, 6, 0, 2, 2],
    [A("s6:menyusup"), -0.5, 2.5, 4, 0, 1.8, 1],
    [A("s6:habis"), 1, 3, 5, 0, 2, 0],
    [A("s6:terguling"), 2, 2.5, 4.5, 0, 1.5, 0],
    [s("s7") - 0.3, 0, 4.5, 8, 0, 3, 0],
    [A("s7:delapan"), 0, 4, 7, 0, 2.5, 0],
    [A("s7:Casablanca"), 2, 3.5, 6, 0, 2, 0],
    [s("s8") - 0.2, -3, 5.5, 14, 0, 2, 0],
    [A("s8:menjebak"), -4, 6, 16, 0, 1.5, 0],
    [s("end"), -5, 7, 18, 0, 1, 0],
  ]);

  return (t) => {
    const [cx, cy, cz, lx, ly, lz] = cam1(t);
    cam.position.set(cx + 0.04 * Math.sin(t * 0.6), cy + 0.03 * Math.sin(t * 0.8), cz);
    cam.lookAt(lx, ly, lz);
    key.position.set(cx - 4, 14, 10); key.target.position.set(lx, ly, lz);
    fill.position.set(cx + 5, cy + 3, cz + 6); fill.target.position.set(lx, ly, lz);
    sea.material.map.offset.set(t * 0.012, t * 0.008);
    sea.position.y = 0.15 * Math.sin(t * 0.8); // gentle swell

    // s2: tetrapod label
    labTetra.material.opacity = ramp(t, A("s2:tetrapod") - 0.3, A("s2:tetrapod") + 0.3) * (1 - ramp(t, s("s3") - 0.4, s("s3")));

    // s3: flat wall
    const flat = ramp(t, s("s3") - 0.3, s("s3") + 0.3) * (1 - ramp(t, s("s4") - 0.5, s("s4")));
    FLAT.visible = flat > 0.01; FLAT.children.forEach((c) => { if (c.material) c.material.opacity = flat; });
    reflArrow.material.opacity = ramp(t, A("s3:memantulkannya") - 0.3, A("s3:memantulkannya") + 0.3) * flat;

    // s5: 50% label
    lab50.material.opacity = ramp(t, A("s5:separuh") - 0.3, A("s5:separuh") + 0.3) * (1 - ramp(t, s("s6") - 0.4, s("s6")));

    // s6: wave particles rush into gaps
    const wave = ramp(t, A("s6:menyusup") - 0.5, A("s6:menyusup") + 0.3) * (1 - ramp(t, s("s7") - 0.5, s("s7")));
    wavePts.material.opacity = 0.7 * wave;
    for (let i = 0; i < NW; i++) {
      const b = waveBase[i]; const phase = ((b[2] - t * 2 * (0.5 + b[3])) % 4 + 4) % 4;
      wavePos[i * 3] = b[0]; wavePos[i * 3 + 1] = 0.3 + b[1] * 0.8; wavePos[i * 3 + 2] = phase + 2;
    }
    waveGeo.attributes.position.needsUpdate = true;
    arrowIn.material.opacity = ramp(t, A("s6:menyusup") - 0.3, A("s6:menyusup")) * (1 - ramp(t, A("s6:habis"), A("s6:habis") + 0.5)) * (1 - ramp(t, s("s7") - 0.3, s("s7")));
    arrowOut.material.opacity = ramp(t, A("s6:Pantulannya") - 0.3, A("s6:Pantulannya") + 0.3) * (1 - ramp(t, s("s7") - 0.3, s("s7")));
    labCoG.material.opacity = ramp(t, A("s6:terguling") - 0.3, A("s6:terguling") + 0.3) * (1 - ramp(t, s("s7") - 0.4, s("s7")));

    // s7: scale comparison + Hudson
    const hudson = ramp(t, s("s7") - 0.3, s("s7") + 0.5) * (1 - ramp(t, s("s8") - 0.5, s("s8")));
    SCALE.visible = hudson > 0.01;
    SCALE.children.forEach((c) => { if (c.material) c.material.opacity = hudson; });
    labSmall.material.opacity = hudson; labBig.material.opacity = hudson;
    labHudson.material.opacity = ramp(t, A("s7:Hudson") - 0.3, A("s7:Hudson") + 0.3) * hudson;

    // s8: warm golden light
    const golden = ramp(t, s("s8") - 0.5, s("s8") + 1.0);
    gradeP.uniforms.warm.value = golden;
    key.color.setHex(golden > 0.5 ? 0xffe0a0 : 0xfff0d8);

    // flash on wave crash (s1)
    gradeP.uniforms.flash.value = 0.2 * Math.max(0, 1 - Math.abs(t - A("s1:masuk")) / 0.3);

    comp.render();
  };
}
