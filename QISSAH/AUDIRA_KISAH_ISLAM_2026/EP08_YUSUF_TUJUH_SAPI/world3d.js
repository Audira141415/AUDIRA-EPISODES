// EP08 YUSUF DAN TUJUH SAPI. DATAPHYSICAL meets ancient Egypt: brushed brass and aluminium data sculptures on a long
// sandstone plinth beside the Nile, under a lapis sky with gold. Nabi Yusuf never appears: his presence is a reed pen and a
// scroll in a shaft of prison-window light. Courtiers are faceless dark silhouettes. Every value is a pure function of t.
// Plinth runs along +x: dream tableau (x≈-44), prison cell (x≈-18), the 15 year-columns (x 2..38), treasury gate (x≈52).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

const XA = -44, XB = -18, X0 = 2, DX = 2.6, XD = 52;
const U = 0.78; // height of one sheaf unit
const BRASS = 0xc9a14a, ALU = 0xc4ccd4, SAND = 0xd8b98a, LAPIS = 0x1f3a8a;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x1a2a5a, fog: 0.006, exp: 1.05, bloom: [0.35, 0.5, 0.86], fov: 38 });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1247);
  envStrips(r, scene, [[40, 6, 0xffd9a0, 2.2, 0, 30, 40], [60, 4, 0x6f8fe0, 1.4, -50, 10, -20], [30, 30, 0xffe2b0, 1.2, 40, 50, 0], [80, 3, 0xffffff, 0.8, 0, -20, 50]], 0x0a0d18);

  // ---------- timing
  const HY = Array.from({ length: 7 }, (_, k) => A("s4:Bercocok") + k * 0.88);          // harvest years 1..7
  const DY = Array.from({ length: 7 }, (_, k) => A("s5:datang") + k * 0.74);            // drought years 8..14
  const RY = A("s6:hujan") - 0.3;                                                        // year 15
  const YT = [...HY, ...DY, RY];
  const stock = (t) => {
    let s = 0;
    for (let k = 0; k < 7; k++) s += ramp(t, HY[k], HY[k] + 0.5);
    for (let k = 0; k < 7; k++) s -= (k === 6 ? 0.82 : 1) * ramp(t, DY[k], DY[k] + 0.5);
    return s + 0.6 * ramp(t, RY + 1.5, RY + 3);
  };
  // mood 0 dream (violet night), 1 cell night, 2 gold day, 3 dusty drought, 4 rain, 5 warm interior, 6 dusk
  const MOOD = [
    [0x1b1f4f, 0x6b5a9a, 0x8f86c8, 0.75], [0x060a1c, 0x1d2a55, 0x7fa0ff, 0.35], [0x2c5fb8, 0xf2c98a, 0xffe0a8, 1.25],
    [0x7a8aa0, 0xe8d2a8, 0xfff0d0, 1.05], [0x3a4c6a, 0x8aa0b8, 0xcfe0ff, 0.7], [0x24304f, 0xe0a860, 0xffc880, 1.0], [0x18234f, 0xf09a58, 0xffb070, 0.95],
  ];
  const moodW = (t) => {
    const w = [0, 0, 0, 0, 0, 0, 0];
    const seg = [
      [0, 0], [K.s3 - 0.3, 0], [K.s3 + 0.6, 1], [A("s4:Bercocok") - 0.8, 1], [A("s4:Bercocok") + 0.6, 2], [A("s5:Karena"), 2], [A("s5:datang"), 3],
      [K.s6 + 0.2, 3], [A("s6:hujan") - 0.2, 4], [A("s6:memeras"), 4], [A("s6:Mimpi"), 2], [K.s7 - 0.2, 2], [A("s7:Setelah") + 1.6, 5], [K.s8 - 0.2, 5], [K.s8 + 1.4, 6], [1e9, 6],
    ];
    let i = 0;
    while (i < seg.length - 2 && seg[i + 1][0] < t) i++;
    const [ta, ma] = seg[i], [tb, mb] = seg[i + 1];
    const f = ma === mb ? 0 : clamp01((t - ta) / Math.max(0.01, tb - ta));
    w[ma] += 1 - f; w[mb] += f;
    return w;
  };

  // ---------- sky dome and fog
  const skyU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uStar: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor;uniform float uStar;varying vec3 vP;
float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
void main(){float y=clamp(vP.y,-.1,1.);vec3 c=mix(uHor,uTop,pow(smoothstep(-.05,.6,y),.7));
vec3 q=floor(vP*260.);float s=step(.9965,h(q))*smoothstep(.05,.3,y)*uStar;c+=vec3(1.,.9,.7)*s;gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; scene.add(sky);

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xbfd0ff, 0x6a4a2a, 0.55); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffe0a8, 1.6);
  sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
  Object.assign(sunL.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 200 });
  sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
  scene.add(sunL); scene.add(sunL.target);

  // ---------- textures
  const brushed = (seed, base, streak) => canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${streak},${0.04 + q() * 0.1})`; g.lineWidth = 0.5 + q() * 1.5; const y = q() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (q() - .5) * 3); g.stroke(); }
  });
  const brassMap = brushed(11, "#c9a14a", "255,236,190"), aluMap = brushed(12, "#c4ccd4", "255,255,255");
  const mBrass = new THREE.MeshStandardMaterial({ color: 0xffffff, map: brassMap, metalness: 0.92, roughness: 0.34 });
  const mBrassDark = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, metalness: 0.9, roughness: 0.45 });
  const mAlu = new THREE.MeshStandardMaterial({ color: 0xffffff, map: aluMap, metalness: 0.95, roughness: 0.28 });
  const mWire = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 1, roughness: 0.25, wireframe: true, emissive: 0x334455, emissiveIntensity: 0.4 });
  const sandTex = canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(5); g.fillStyle = "#d4b07c"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${q() < .5 ? "120,80,40" : "255,240,210"},${q() * 0.12})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1 + q() * 3); }
    g.strokeStyle = "rgba(90,60,30,.35)"; g.lineWidth = 3;
    for (let y = 0; y <= h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let y = 0; y < h; y += 128) for (let x = (y / 128) % 2 ? 64 : 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 128); g.stroke(); }
  }, [40, 8]);
  const mSand = new THREE.MeshStandardMaterial({ color: 0xffffff, map: sandTex, roughness: 0.92, metalness: 0 });
  const mStone = new THREE.MeshStandardMaterial({ color: 0xc8a676, map: sandTex, roughness: 0.95 });

  // ---------- plinth, steps, the Nile, far bank
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(130, 3, 24), mSand);
  plinth.position.set(2, -1.5, 2.5); plinth.receiveShadow = true; scene.add(plinth);
  const step = new THREE.Mesh(new THREE.BoxGeometry(134, 1.2, 4), mStone); step.position.set(2, -2.4, -10.5); step.receiveShadow = true; scene.add(step);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(130, 0.18, 0.35), mBrass); lip.position.set(2, 0.02, 14.4); scene.add(lip);
  // the Nile: lapis water with a scrolling normal map so it glints
  const nrm = (() => {
    const N = 256, hgt = new Float32Array(N * N), q = mulberry(9);
    const waves = Array.from({ length: 10 }, () => [q() * 6.28, 1 + Math.floor(q() * 6), Math.floor(q() * 5) - 2, 0.3 + q()]);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let s = 0; for (const [p, a, b, m] of waves) s += Math.sin((a * x + b * y) / N * 6.283 + p) * m; hgt[y * N + x] = s; }
    return canvasTex(N, N, (g) => {
      const im = g.createImageData(N, N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const dx = hgt[y * N + (x + 1) % N] - hgt[y * N + (x + N - 1) % N], dy = hgt[((y + 1) % N) * N + x] - hgt[((y + N - 1) % N) * N + x];
        const nx = -dx * 0.6, ny = -dy * 0.6, l = Math.hypot(nx, ny, 1), i = (y * N + x) * 4;
        im.data[i] = (nx / l * .5 + .5) * 255; im.data[i + 1] = (ny / l * .5 + .5) * 255; im.data[i + 2] = (1 / l * .5 + .5) * 255; im.data[i + 3] = 255;
      }
      g.putImageData(im, 0, 0);
    }, [30, 14]);
  })();
  nrm.colorSpace = THREE.NoColorSpace;
  const mWater = new THREE.MeshStandardMaterial({ color: 0x1b3f8c, metalness: 0.6, roughness: 0.16, normalMap: nrm, normalScale: new THREE.Vector2(0.7, 0.7) });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1000, 300), mWater);
  water.rotation.x = -Math.PI / 2; water.position.set(0, -2.6, -160); scene.add(water);
  const farBank = new THREE.Mesh(new THREE.PlaneGeometry(1000, 300), mSand);
  farBank.rotation.x = -Math.PI / 2; farBank.position.set(0, -2.0, -455); scene.add(farBank);
  [[-60, 30], [-20, 46], [30, 36], [120, 28], [170, 40]].forEach(([x, s]) => {
    const p = new THREE.Mesh(new THREE.ConeGeometry(s * 0.72, s * 0.66, 4), mStone); p.rotation.y = Math.PI / 4; p.position.set(x, -2 + s * 0.33, -330 - s); scene.add(p);
  });
  // palms on both banks
  const mTrunk = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9 }), mFrond = new THREE.MeshStandardMaterial({ color: 0x3f6a2e, roughness: 0.8, side: THREE.DoubleSide });
  const frondG = new THREE.PlaneGeometry(3.2, 0.7); frondG.translate(1.6, 0, 0);
  const palm = (x, z, h) => {
    const G = new THREE.Group(); G.position.set(x, -2.4, z); scene.add(G);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, h, 7), mTrunk); tr.position.y = h / 2; tr.rotation.z = 0.06; tr.castShadow = true; G.add(tr);
    for (let k = 0; k < 8; k++) { const f = new THREE.Mesh(frondG, mFrond); f.position.set(0.2, h, 0); f.rotation.set(0.2, k * 0.785, -0.45); f.castShadow = true; G.add(f); }
    return G;
  };
  for (let k = 0; k < 16; k++) palm(-60 + k * 8.5 + rnd() * 3, -13 - rnd() * 3, 8 + rnd() * 4);
  for (let k = 0; k < 30; k++) palm(-140 + k * 11 + rnd() * 5, -300 - rnd() * 6, 9 + rnd() * 4);

  // ---------- zone A: the king's dream as a brass tableau
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.16, 64), new THREE.MeshStandardMaterial({ color: 0x2a4a9a, metalness: 0.5, roughness: 0.35 })); ring.position.set(XA, 0.08, 1.5); ring.receiveShadow = true; scene.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(11, 0.12, 8, 96), mBrass); ring2.rotation.x = Math.PI / 2; ring2.position.set(XA, 0.17, 1.5); scene.add(ring2);
  const cow = (mat, lean) => {
    const G = new THREE.Group(), seg = lean ? [9, 6] : [20, 14];
    const add = (geo, x, y, z, sx = 1, sy = 1, sz = 1, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.z = rz; m.castShadow = true; G.add(m); return m; };
    const sph = new THREE.SphereGeometry(1, seg[0], seg[1]);
    if (lean) { add(sph, 0, 1.45, 0, 1.15, 0.36, 0.26); add(sph, -0.35, 1.32, 0, 0.55, 0.3, 0.22); }
    else { add(sph, 0, 1.38, 0, 1.3, 0.66, 0.6); add(sph, -0.55, 1.35, 0, 0.75, 0.6, 0.55); }
    add(new THREE.CylinderGeometry(lean ? 0.12 : 0.24, lean ? 0.16 : 0.34, 0.75, seg[0]), 1.2, 1.75, 0, 1, 1, 1, -0.95);
    add(new THREE.BoxGeometry(0.62, 0.36, lean ? 0.3 : 0.38, lean ? 2 : 1, 1, 1), 1.62, 1.92, 0, 1, 1, 1, -0.55);
    const horn = new THREE.TorusGeometry(0.22, 0.04, 6, 12, Math.PI);
    for (const s of [-1, 1]) { const h = add(horn, 1.45, 2.18, s * 0.16); h.rotation.set(0, s * 0.5, 0); }
    const leg = new THREE.CylinderGeometry(lean ? 0.06 : 0.12, lean ? 0.05 : 0.09, 1.1, seg[0] > 10 ? 10 : 6);
    for (const [x, z] of [[0.85, 0.26], [0.85, -0.26], [-0.9, 0.26], [-0.9, -0.26]]) add(leg, x, 0.55, z);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), -1.38, 1.1, 0, 1, 1, 1, 0.25);
    return G;
  };
  const FAT = [], LEAN = [];
  for (let i = 0; i < 7; i++) {
    const f = cow(mBrass, false); f.position.set(XA - 7.4 + i * 2.45, 0.17, 1.2); scene.add(f); FAT.push(f);
    const l = cow(mWire, true); l.position.set(XA - 7.4 + i * 2.45, 0.17, -4.2); scene.add(l); LEAN.push(l);
  }
  // seven green ears and seven dry ears
  const earTex = (green) => canvasTex(128, 256, (g, w, h) => {
    const q = mulberry(green ? 3 : 4); g.fillStyle = green ? "#3f7a3a" : "#b49a62"; g.fillRect(0, 0, w, h);
    for (let y = 8; y < h; y += 18) for (let x = 6; x < w; x += 22) { g.fillStyle = green ? `rgba(160,220,120,${0.4 + q() * 0.4})` : `rgba(240,220,170,${0.3 + q() * 0.3})`; g.beginPath(); g.ellipse(x + (y % 36 ? 10 : 0), y, 7, 9, 0, 0, 7); g.fill(); }
  });
  const earProf = [[0, 0], [0.09, 0.08], [0.13, 0.35], [0.12, 0.7], [0.07, 0.95], [0, 1.05]].map(([x, y]) => new THREE.Vector2(x, y));
  const earG = new THREE.LatheGeometry(earProf, 10); earG.scale(1.5, 1.5, 1.5);
  const mEarG = new THREE.MeshStandardMaterial({ map: earTex(true), roughness: 0.4, metalness: 0.35 });
  const mEarD = new THREE.MeshStandardMaterial({ map: earTex(false), roughness: 0.8, metalness: 0.1 });
  const mStalkG = new THREE.MeshStandardMaterial({ color: 0x4f8a3a, roughness: 0.5, metalness: 0.3 }), mStalkD = new THREE.MeshStandardMaterial({ color: 0x9a8458, roughness: 0.9 });
  const EARS = [];
  for (let i = 0; i < 14; i++) {
    const green = i < 7, G = new THREE.Group();
    G.position.set(XA - 8.2 + i * 1.12 + (green ? 0 : 0.6), 0.17, 6.4 + (i % 2) * 0.5); scene.add(G);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 2.4, 6), green ? mStalkG : mStalkD); st.position.y = 1.2; st.castShadow = true; G.add(st);
    const e = new THREE.Mesh(earG, green ? mEarG : mEarD); e.position.y = 2.35; e.castShadow = true; G.add(e);
    if (!green) { e.rotation.z = 0.9 + rnd() * 0.3; e.position.x = 0.3; st.rotation.z = 0.12; }
    EARS.push({ G, green, k: i % 7 });
  }
  // faceless courtiers: dark robed silhouettes with a plain head, arms that rise in a shrug
  const mRobe = new THREE.MeshStandardMaterial({ color: 0x4a2e22, roughness: 0.85 }), mHead = new THREE.MeshStandardMaterial({ color: 0x3a241a, roughness: 0.7 });
  const COURT = [];
  for (let i = 0; i < 5; i++) {
    const G = new THREE.Group(); G.position.set(XA + 9 + (i % 2) * 1.3, 0.17, 1.5 + i * 1.5); G.rotation.y = Math.PI - 0.5 + i * 0.15; scene.add(G);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 2.3, 12), mRobe); body.position.y = 1.15; body.castShadow = true; G.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), mHead); head.position.y = 2.6; G.add(head);
    const cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.48, 0.5, 12, 1, true), mBrassDark); cloth.position.y = 2.55; G.add(cloth);
    const arms = [];
    for (const s of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(0, 2.05, s * 0.45); G.add(piv);
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 8), mRobe); a.position.y = -0.5; piv.add(a); arms.push([piv, s]);
    }
    COURT.push({ G, arms, ph: i * 0.13 });
  }
  const dreamDust = pts(scene, 360, { color: 0xffd98a, size: 0.16, opacity: 0.85 });
  const ddSeed = Array.from({ length: 360 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- zone B: the prison cell, a window of light, reed pen and scroll
  const cellG = new THREE.Group(); scene.add(cellG);
  const wall = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mStone); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; cellG.add(m); return m; };
  wall(5.4, 10, 1, XB - 3.9, 5, -3); wall(5.4, 10, 1, XB + 3.9, 5, -3); wall(2.4, 4.6, 1, XB, 2.3, -3); wall(2.4, 3.2, 1, XB, 8.4, -3);
  wall(1, 10, 9, XB - 7.1, 5, 1); wall(1, 10, 9, XB + 7.1, 5, 1);
  for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), mBrassDark); b.position.set(XB - 0.6 + k * 0.6, 5.7, -3); cellG.add(b); }
  const beamM = new THREE.MeshBasicMaterial({ color: 0xbcd0ff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beamG = new THREE.CylinderGeometry(1.0, 2.1, 7.6, 4, 1, true); beamG.rotateY(Math.PI / 4);
  const beam = new THREE.Mesh(beamG, beamM); beam.position.set(XB, 3.1, -0.6); beam.rotation.x = -0.62; cellG.add(beam);
  const patchM = new THREE.MeshBasicMaterial({ color: 0xc8d8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), patchM); patch.rotation.x = -Math.PI / 2; patch.position.set(XB, 0.03, 2.4); cellG.add(patch);
  const winL = new THREE.SpotLight(0xc8d8ff, 0, 18, 0.5, 0.6, 1.2); winL.position.set(XB, 6, -3.4); winL.target.position.set(XB, 0, 2.4); scene.add(winL, winL.target);
  // the scroll: parchment with the plan drawn row by row, each row hidden under a parchment cover that the pen pulls away
  const SCX = XB, SCZ = 2.3, SCW = 3.6, SCH = 2.2;
  const planTex = canvasTex(1024, 640, (g, w, h) => {
    g.fillStyle = "#efdcae"; g.fillRect(0, 0, w, h);
    const q = mulberry(21);
    for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(140,100,50,${q() * 0.07})`; g.fillRect(q() * w, q() * h, 2 + q() * 6, 2 + q() * 6); }
    const rowY = [110, 260, 410, 555];
    g.lineCap = "round";
    for (let k = 0; k < 7; k++) { // seven sheaves
      const x = 90 + k * 120, y = rowY[0];
      g.strokeStyle = "#8a5a12"; g.lineWidth = 5; for (let s = -3; s <= 3; s++) { g.beginPath(); g.moveTo(x + s * 4, y + 50); g.lineTo(x + s * 7, y - 40); g.stroke(); }
      g.strokeStyle = "#1a2f6e"; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 16, y + 12); g.lineTo(x + 16, y + 12); g.stroke();
    }
    for (let k = 0; k < 7; k++) { // seven granary marks filling
      const x = 90 + k * 120, y = rowY[1]; g.strokeStyle = "#1a2f6e"; g.lineWidth = 5; g.strokeRect(x - 28, y - 40, 56, 90);
      g.fillStyle = "#b8862a"; g.fillRect(x - 24, y + 46 - 12 * (k + 1), 48, 12 * (k + 1));
    }
    for (let k = 0; k < 7; k++) { // seven draining
      const x = 90 + k * 120, y = rowY[2]; g.strokeStyle = "#5a5a5a"; g.lineWidth = 5; g.strokeRect(x - 28, y - 40, 56, 90);
      g.fillStyle = "#b8862a"; const hh = k === 6 ? 6 : 12 * (6 - k); g.fillRect(x - 24, y + 46 - hh, 48, hh);
    }
    const y = rowY[3]; g.fillStyle = "#1a2f6e"; // rain drops and a grape cluster
    for (let k = 0; k < 9; k++) { const x = 120 + k * 50; g.beginPath(); g.moveTo(x, y - 40); g.quadraticCurveTo(x + 14, y, x, y + 10); g.quadraticCurveTo(x - 14, y, x, y - 40); g.fill(); }
    g.fillStyle = "#5a2a6e"; for (let k = 0; k < 10; k++) { const a = [0, 1, 2, 3, 1.5, 2.5, 0.5, 2, 1, 1.5][k], b = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3][k]; g.beginPath(); g.arc(700 + a * 34, y - 40 + b * 28, 16, 0, 7); g.fill(); }
  });
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(SCW, SCH), new THREE.MeshStandardMaterial({ map: planTex, roughness: 0.85 }));
  scroll.rotation.x = -Math.PI / 2; scroll.position.set(SCX, 0.06, SCZ); scroll.receiveShadow = true; cellG.add(scroll);
  for (const s of [-1, 1]) { const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, SCH + 0.3, 12), mBrass); rl.rotation.x = Math.PI / 2; rl.position.set(SCX + s * (SCW / 2 + 0.08), 0.12, SCZ); rl.castShadow = true; cellG.add(rl); }
  const mParch = new THREE.MeshStandardMaterial({ color: 0xefdcae, roughness: 0.9 });
  const COVERS = [];
  for (let k = 0; k < 4; k++) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(1, SCH / 4), mParch); c.rotation.x = -Math.PI / 2;
    c.position.set(SCX, 0.07, SCZ - SCH / 2 + SCH / 8 + k * SCH / 4); cellG.add(c); COVERS.push(c);
  }
  // the reed pen: a slender reed with a cut nib, hovering, no hand
  const pen = new THREE.Group(); scene.add(pen);
  const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 2.0, 10), new THREE.MeshStandardMaterial({ color: 0xb08a4a, roughness: 0.6 })); reed.position.y = 1.0; reed.castShadow = true; pen.add(reed);
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.26, 10), new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4 })); nib.rotation.x = Math.PI; nib.position.y = -0.04; pen.add(nib);
  for (const yy of [0.5, 1.0]) { const kn = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12), mBrassDark); kn.rotation.x = Math.PI / 2; kn.position.y = yy; pen.add(kn); }
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 16), mLapisMat()); ink.position.set(SCX + 2.5, 0.15, SCZ + 0.9); cellG.add(ink);
  // dream within the story (QS 12:4): eleven stars, the sun and the moon, bowing toward the place of the scroll
  const bowG = new THREE.Group(); bowG.position.set(XB, 0.1, 2.3); scene.add(bowG);
  const arcG = new THREE.Group(); bowG.add(arcG);
  const mStar = new THREE.MeshStandardMaterial({ color: 0xffd36a, emissive: 0xffb83a, emissiveIntensity: 1.6, metalness: 0.6, roughness: 0.3 });
  const starG = new THREE.OctahedronGeometry(0.32, 0); starG.scale(1, 1.35, 0.5);
  const SKY = [];
  for (let i = 0; i < 11; i++) {
    const a = -1.15 + i * 0.23, m = new THREE.Mesh(starG, mStar);
    m.userData.p = new THREE.Vector3(Math.sin(a) * 4.2, 2.6 + Math.cos(a) * 1.8, -3.0 + Math.cos(a) * 0.6); arcG.add(m); SKY.push({ m, k: i, a });
  }
  const sunD = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 20), new THREE.MeshStandardMaterial({ color: 0xffc040, emissive: 0xff9a20, emissiveIntensity: 2.2, metalness: 0.3, roughness: 0.4 }));
  sunD.userData.p = new THREE.Vector3(-1.4, 5.4, -3.6); arcG.add(sunD);
  const moonShape = new THREE.Shape(); moonShape.absarc(0, 0, 0.62, 0.6, Math.PI * 2 - 0.6, false); moonShape.absarc(0.32, 0, 0.5, Math.PI * 2 - 0.9, 0.9, true);
  const moonD = new THREE.Mesh(new THREE.ExtrudeGeometry(moonShape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0xe8eef8, emissive: 0x8090b0, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.25 }));
  moonD.userData.p = new THREE.Vector3(1.4, 5.4, -3.6); arcG.add(moonD);

  // ---------- zone C: the plan as fifteen year-columns
  const plateTex = (n, col, ink2) => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = ink2; g.font = "bold 150px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), w / 2, h / 2 + 8);
  });
  const colX = (i) => X0 + i * DX;
  const PLATES = [];
  for (let i = 0; i < 15; i++) {
    const harvest = i < 7, rain = i === 14;
    const m = new THREE.MeshStandardMaterial({ map: plateTex(i + 1, harvest ? "#c49a44" : rain ? "#2a4c9a" : "#b9c2cc", harvest ? "#3a2408" : rain ? "#f2d27a" : "#2a3440"), metalness: rain ? 0.4 : 0.85, roughness: 0.35 });
    const p = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 2.1), [mBrassDark, mBrassDark, m, mBrassDark, mBrassDark, mBrassDark]);
    p.position.set(colX(i), 0.11, 0); p.castShadow = p.receiveShadow = true; scene.add(p); PLATES.push(p);
  }
  // sheaves (grain kept on the stalk): lathe bundle with a tied waist and a full head of ears
  const shProf = [[0, 0], [0.5, 0.0], [0.42, 0.1], [0.3, 0.36], [0.28, 0.42], [0.36, 0.5], [0.52, 0.66], [0.5, 0.74], [0.3, 0.8], [0, 0.82]].map(([x, y]) => new THREE.Vector2(x, y * U / 0.82));
  const shG = new THREE.LatheGeometry(shProf, 36);
  { const pa = shG.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), an = Math.atan2(z, x), f = y > 0.55 * U ? 1 + 0.16 * Math.sin(an * 11) * Math.sin(an * 3 + 1) : y < 0.15 * U ? 1 + 0.14 * Math.sin(an * 17) : 1; pa.setXYZ(i, x * f, y, z * f); } shG.computeVertexNormals(); }
  const shTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#b8862a"; g.fillRect(0, 0, w, h); const q = mulberry(31);
    for (let x = 0; x < w; x += 3) { g.strokeStyle = `rgba(${q() < .5 ? "255,220,140" : "110,70,20"},${0.3 + q() * 0.4})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, h * 0.45); g.lineTo(x + (q() - .5) * 4, h); g.stroke(); }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,${200 + q() * 50},${110 + q() * 60},${0.5 + q() * 0.4})`; g.beginPath(); g.ellipse(q() * w, q() * h * 0.42, 3, 5, 0, 0, 7); g.fill(); }
    g.fillStyle = "#1f3a8a"; g.fillRect(0, h * 0.44, w, h * 0.06);
  });
  const mSheaf = new THREE.MeshStandardMaterial({ map: shTex, metalness: 0.4, roughness: 0.55 });
  const SH = []; // {i, k, t}
  for (let i = 0; i < 7; i++) for (let k = 0; k <= i; k++) SH.push({ i, k, t: HY[i] });
  for (let j = 0; j < 6; j++) for (let k = 0; k < 6 - j; k++) SH.push({ i: 7 + j, k, t: DY[j] });
  const sheaves = new THREE.InstancedMesh(shG, mSheaf, SH.length); sheaves.castShadow = true; sheaves.frustumCulled = false; scene.add(sheaves);
  // aluminium cages for drought years: the empty volume shows what was eaten
  const cageH = 7 * U;
  const CAGES = [];
  for (let j = 0; j < 7; j++) {
    const G = new THREE.Group(); G.position.set(colX(7 + j), 0.22, 0); scene.add(G);
    for (const [x, z] of [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.62], [0.62, 0.62]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, cageH, 0.08), mAlu); b.position.set(x, cageH / 2, z); b.castShadow = true; G.add(b); }
    for (const y of [0.04, cageH]) for (const [x, z, w, d] of [[0, -0.62, 1.32, 0.08], [0, 0.62, 1.32, 0.08], [-0.62, 0, 0.08, 1.32], [0.62, 0, 0.08, 1.32]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), mAlu); b.position.set(x, y, z); G.add(b); }
    CAGES.push(G);
  }
  // year 14 keeps a little seed: a brass dish with a glowing handful
  const dish = new THREE.Group(); dish.position.set(colX(13), 0.22, 0); scene.add(dish);
  const dishM = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 0.2, 24), mBrass); dishM.position.y = 0.1; dish.add(dishM);
  const seedM = new THREE.MeshStandardMaterial({ color: 0xffd070, emissive: 0xffa020, emissiveIntensity: 0, metalness: 0.5, roughness: 0.4 });
  const seeds = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, 6.3, 0, 1.2), seedM); seeds.scale.set(1, 0.45, 1); seeds.position.y = 0.16; dish.add(seeds);
  // granary silos behind the columns: sandstone cylinders cut open at the front; the gold level is the stock
  const SILOS = [];
  for (const x of [11, 29]) {
    const G = new THREE.Group(); G.position.set(x, 0, -6); scene.add(G);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 8, 32, 1, true, 0.55, Math.PI * 2 - 1.1), new THREE.MeshStandardMaterial({ map: sandTex, color: 0xd9b884, roughness: 0.9, side: THREE.DoubleSide }));
    body.rotation.y = -0.0; body.position.y = 4; body.castShadow = body.receiveShadow = true; G.add(body);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mStone); dome.position.y = 8; dome.castShadow = true; G.add(dome);
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.09, 6, 48), mBrass); band.rotation.x = Math.PI / 2; band.position.y = 8; G.add(band);
    const fill = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1, 32), new THREE.MeshStandardMaterial({ color: 0xd8a640, map: shTex, metalness: 0.55, roughness: 0.45, emissive: 0x3a2400 })); G.add(fill);
    SILOS.push(fill);
  }
  const pour = pts(scene, 500, { color: 0xffcf6a, size: 0.12, opacity: 0.95 });
  const pSeed = Array.from({ length: 500 }, () => [rnd(), rnd(), rnd()]);
  // year cursor: a gold ring sliding under the current year
  const cursor = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.07, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffd36a })); cursor.rotation.x = Math.PI / 2; scene.add(cursor);
  // loose grain heap that dulls (for the Ibnu Katsir note), beside the sheaves
  const heapM = new THREE.MeshStandardMaterial({ color: 0xd8a640, roughness: 0.6, metalness: 0.3 });
  const heap = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.7, 24), heapM); heap.position.set(colX(6) + 0.2, 0.35, 3.0); heap.castShadow = true; scene.add(heap);
  const loose = new THREE.Mesh(shG, mSheaf); loose.position.set(colX(6) - 1.5, 0.0, 3.0); loose.castShadow = true; scene.add(loose);
  // year 15: rain, a vine with grapes, a press bowl filling
  const rain = pts(scene, 900, { color: 0xeaf4ff, size: 0.22, add: false, opacity: 0.9 });
  const rSeed = Array.from({ length: 900 }, () => [rnd(), rnd(), rnd()]);
  const vine = new THREE.Group(); vine.position.set(colX(14), 0.22, 0); scene.add(vine);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.4, 8), mBrassDark); post.position.y = 1.7; vine.add(post);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), mBrassDark); bar.rotation.z = Math.PI / 2; bar.position.y = 3.3; vine.add(bar);
  const leafM = new THREE.MeshStandardMaterial({ color: 0x4f9a3a, roughness: 0.6, side: THREE.DoubleSide });
  const LEAVES = [];
  for (let k = 0; k < 9; k++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.32, 5), leafM); l.position.set(-1 + k * 0.25, 3.45 + (k % 2) * 0.12, (k % 3 - 1) * 0.2); l.rotation.set(-0.6, k, 0.3); vine.add(l); LEAVES.push(l); }
  const grapeM = new THREE.MeshStandardMaterial({ color: 0x5a2a7a, roughness: 0.25, metalness: 0.2, emissive: 0x1a0624 });
  const GR = [];
  for (const cx of [-0.7, 0, 0.7]) {
    const cl = new THREE.Group(); cl.position.set(cx, 3.15, 0); vine.add(cl);
    let n = 0;
    for (let row = 0; row < 5; row++) for (let c = 0; c < 5 - row; c++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), grapeM); b.position.set((c - (4 - row) / 2) * 0.2, -row * 0.18, ((n++ % 2) - 0.5) * 0.12); cl.add(b); }
    GR.push(cl);
  }
  const press = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.55, 0.45, 24, 1, true), new THREE.MeshStandardMaterial({ map: brassMap, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide })); press.position.set(colX(14) + 1.25, 0.45, 1.3); scene.add(press);
  const juice = new THREE.Mesh(new THREE.CircleGeometry(0.68, 24), new THREE.MeshStandardMaterial({ color: 0x6a1a5a, roughness: 0.1, metalness: 0.3 })); juice.rotation.x = -Math.PI / 2; juice.position.set(colX(14) + 1.25, 0.25, 1.3); scene.add(juice);
  const sprouts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0x5aa83a, roughness: 0.6 }), 120);
  sprouts.frustumCulled = false; scene.add(sprouts);
  const spSeed = Array.from({ length: 120 }, () => [rnd(), rnd(), rnd()]);
  // payoff: the dream's cows return as small figures over the columns they stood for
  const MINI = [];
  for (let i = 0; i < 14; i++) { const c = cow(i < 7 ? mBrass : mWire, i >= 7); c.scale.setScalar(0.42); scene.add(c); MINI.push(c); }

  // ---------- zone D: the gate that stays shut until the name is cleared, then the treasury
  const gateG = new THREE.Group(); gateG.position.set(XD, 0, 0); scene.add(gateG);
  for (const s of [-1, 1]) {
    const py = new THREE.Mesh(new THREE.BoxGeometry(3.2, 9, 2.6), mStone); py.position.set(s * 3.1, 4.5, -1); py.castShadow = py.receiveShadow = true; gateG.add(py);
    const bandP = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.25, 2.7), mBrass); bandP.position.set(s * 3.1, 8.2, -1); gateG.add(bandP);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.4, 2.8), mStone); lintel.position.set(0, 9.6, -1); lintel.castShadow = true; gateG.add(lintel);
  const DOORS = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(s * 1.5, 0, -0.4); gateG.add(piv);
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8.2, 0.2), mBrass); d.position.set(-s * 0.75, 4.1, 0); d.castShadow = true; piv.add(d);
    for (const y of [2, 4.1, 6.2]) { const r2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.26), mBrassDark); r2.position.set(-s * 0.75, y, 0); piv.add(r2); }
    DOORS.push([piv, s]);
  }
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3, 8.2), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); glow.position.set(0, 4.1, -0.55); gateG.add(glow);
  // the name scroll on a lectern: an ink blot over it fades when the name is cleared (QS 12:50-51)
  const lect = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.7), mStone); lect.position.set(XD - 4.6, 0.6, 3.0); lect.castShadow = true; scene.add(lect);
  const nameTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#efdcae"; g.fillRect(0, 0, w, h); g.fillStyle = "#1f3a8a"; g.font = "bold 92px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("YUSUF", w / 2, h / 2 + 6); g.strokeStyle = "#a07a2a"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); });
  const nameS = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.8, emissive: 0xffffff, emissiveMap: nameTex, emissiveIntensity: 0.15 }));
  nameS.position.set(XD - 4.6, 1.75, 3.25); nameS.rotation.x = -0.55; scene.add(nameS);
  const blotTex = canvasTex(256, 128, (g, w, h) => { const q = mulberry(44); g.clearRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = w / 2 + (q() - .5) * w * .7, y = h / 2 + (q() - .5) * h * .6, rr = 14 + q() * 30; g.fillStyle = "rgba(20,16,24,.85)"; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } });
  const blotM = new THREE.MeshBasicMaterial({ map: blotTex, transparent: true, opacity: 1, depthWrite: false });
  const blot = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), blotM); blot.position.set(XD - 4.6, 1.76, 3.265); blot.rotation.x = -0.55; scene.add(blot);
  // treasury interior: rows of stored sheaves, the ledger, the key
  const vault = new THREE.Mesh(new THREE.BoxGeometry(9.2, 8.6, 10), openFront(new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9, side: THREE.BackSide }))); vault.position.set(XD, 4.3, -7.3); scene.add(vault);
  const vaultOut = new THREE.Mesh(new THREE.BoxGeometry(9.6, 8.9, 10.2), openFront(mStone)); vaultOut.position.set(XD, 4.45, -7.4); vaultOut.castShadow = vaultOut.receiveShadow = true; scene.add(vaultOut);
  const VS = [];
  for (const sx of [-1, 1]) for (let row = 0; row < 4; row++) for (let c = 0; c < 4; c++) VS.push([XD + sx * (2.6 + (row % 2) * 1.0), 0.2 + c * U, -4.6 - row * 1.4]);
  const vSheaves = new THREE.InstancedMesh(shG, mSheaf, VS.length); vSheaves.frustumCulled = false;
  VS.forEach((p, i) => vSheaves.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p[0], p[1], p[2])));
  scene.add(vSheaves);
  const vLamp = new THREE.PointLight(0xffb060, 0, 18, 1.5); vLamp.position.set(XD, 5, -6); scene.add(vLamp);
  const table = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.1, 1.6), mStone); table.position.set(XD, 0.55, -5.2); table.castShadow = true; scene.add(table);
  const ledgerTex = canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = "#efdcae"; g.fillRect(0, 0, w, h); g.fillStyle = "#c9b07a"; g.fillRect(w / 2 - 3, 0, 6, h);
    const q = mulberry(55); g.strokeStyle = "rgba(31,58,138,.5)"; g.lineWidth = 2;
    for (let y = 30; y < h - 10; y += 24) { g.beginPath(); g.moveTo(20, y); g.lineTo(w / 2 - 16, y); g.moveTo(w / 2 + 16, y); g.lineTo(w - 20, y); g.stroke(); }
    g.fillStyle = "#7a4a10";
    for (let y = 26; y < h - 10; y += 24) { const n = 1 + Math.floor(q() * 7); for (let k = 0; k < n; k++) g.fillRect(36 + k * 12, y - 14, 4, 12); const m = 1 + Math.floor(q() * 7); for (let k = 0; k < m; k++) g.fillRect(w / 2 + 32 + k * 12, y - 14, 4, 12); }
  });
  const ledger = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.3), [mBrassDark, mBrassDark, new THREE.MeshStandardMaterial({ map: ledgerTex, roughness: 0.8 }), mBrassDark, mBrassDark, mBrassDark]);
  ledger.position.set(XD, 1.16, -5.2); ledger.castShadow = true; scene.add(ledger);
  const key = new THREE.Group(); scene.add(key);
  const bow2 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 10, 28), mBrass); bow2.position.x = -0.85; key.add(bow2);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 12), mBrass); shaft.rotation.z = Math.PI / 2; shaft.position.x = 0.1; key.add(shaft);
  for (const [x, h] of [[0.55, 0.36], [0.72, 0.26]]) { const bit = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.1), mBrass); bit.position.set(x, -h / 2, 0); key.add(bit); }
  const motes = pts(scene, 300, { color: 0xffe0a0, size: 0.1, opacity: 0.7 });
  const mSeed = Array.from({ length: 300 }, () => [rnd(), rnd(), rnd()]);

  // ---------- camera: [t, px, py, pz, tx, ty, tz]
  const cA = track([
    [0, XA - 20, 8, 24, XA, 2.6, -1],
    [A("s1:dimakan"), XA - 15, 7, 21, XA + 1, 2.4, -1],
    [A("s1:kurus") + 0.6, XA - 10, 6.5, 20, XA + 2, 2.2, -1],
    [A("s1:menyelamatkan"), XA + 2, 14, 30, XA + 1, 3, -1],
    [K.s1e, XA + 6, 17, 33, XA + 1, 3, -1],
    [K.s2, XA - 18, 9, 26, XA, 2.6, 0],
    [A("s2:sapi") + 0.4, XA - 14, 8, 24, XA, 2.4, 0],
    [A("s2:kurus"), XA - 9, 7.5, 22, XA + 1, 2.2, 0],
    [A("s2:tangkai"), XA - 7, 6.5, 22, XA - 2, 2.2, 3],
    [A("s2:kering"), XA + 1, 6.5, 22, XA, 2.2, 3],
    [A("s2:Para"), XA + 8, 8, 27, XA + 8, 2.6, 1],
    [A("s2:angkat"), XA + 10, 7, 24, XA + 9.5, 2.4, 1.5],
    [A("s2:kosong") + 0.2, XA + 13, 10, 26, XA + 5, 3, 1],
    [K.s3 + 0.4, XB - 4, 9, 30, XB, 4.5, 0],
    [A("s3:penjara"), XB - 1, 7, 25, XB, 4, -1],
    [A("s3:Namanya"), XB + 0.5, 5, 18, XB, 2.4, 0],
    [A("s3:sebelas") - 0.3, XB, 6, 25, XB, 6.4, -1],
    [A("s3:bersujud"), XB + 0.3, 6, 24, XB, 6.0, -1],
    [K.s3e, XB + 0.3, 6, 17, XB, 1.8, 1],
    [A("s4:rencana") + 0.2, XB + 0.2, 8.5, 10, XB, 0.4, 1.6],
    [A("s4:Bercocok") - 0.2, XB + 2, 11, 13, XB + 4, 2, 0],
    [HY[2], colX(0) - 12, 11, 27, colX(3), 2.8, 0],
    [HY[6], colX(0) - 8, 12, 28, colX(4), 3.2, 0],
    [A("s4:tangkainya"), colX(3), 7.5, 14, colX(6), 2.4, 1],
    [A("s4:dimakan"), colX(4), 6.5, 13, colX(6), 2.2, 1.5],
    [A("s5:Ibnu"), colX(4), 7, 15, colX(6) - 0.5, 2.4, 1.5],
    [A("s5:awet") + 0.5, colX(6) + 2.5, 6.5, 15, colX(6) - 0.3, 2.4, 1.5],
    [A("s5:Karena"), colX(4), 10, 21, colX(8), 3, 0],
    [DY[2], colX(5), 10.5, 23, colX(10), 3, 0],
    [DY[6], colX(8), 9.5, 22, colX(12), 2.6, 0],
    [A("s5:bibit") + 0.4, colX(12) - 1, 5.5, 10, colX(13), 0.8, 0],
    [K.s6 + 0.3, colX(12) - 1.5, 8, 17, colX(13), 2.4, 0],
    [A("s6:hujan"), colX(13) - 3, 8.5, 18, colX(14), 2.8, 0],
    [A("s6:memeras"), colX(14) - 3.5, 6.5, 13, colX(14) + 0.4, 2.4, 0.6],
    [A("s6:Mimpi"), colX(16), 13, 22, colX(9), 4.5, 0],
    [A("s6:empat"), colX(18), 17, 30, colX(7), 4.5, 0],
    [K.s6e, colX(19), 18, 32, colX(8), 4.5, 0],
    [A("s7:Raja") + 0.3, XD - 11, 8.5, 26, XD - 1, 4, 0],
    [A("s7:menolak"), XD - 3, 6, 22, XD - 1.5, 4, 0],
    [A("s7:dibersihkan"), XD - 5, 5.2, 10, XD - 4.6, 1.6, 3.2],
    [A("s7:bersalah") + 0.3, XD - 4, 5.6, 12, XD - 3.6, 1.8, 2.2],
    [A("s7:meminta"), XD - 1.5, 6.5, 18, XD, 4, -1],
    [A("s7:bendaharawan"), XD, 5, 9.5, XD, 2.2, -5],
    [A("s7:menjaga"), XD + 0.5, 4.4, 6, XD, 1.8, -5.2],
    [K.s7e, XD + 0.4, 4.5, 5.2, XD, 1.8, -5.2],
    [K.s8 + 0.4, XD + 4, 14, 22, colX(10), 3, -2],
    [A("s8:panen"), colX(14), 20, 34, colX(6), 3, -2],
    [K.end, colX(12), 24, 40, colX(5), 3, -4],
    [K.dur, colX(12), 25, 42, colX(5), 3, -4],
  ]);

  const look = new THREE.Vector3(), cTop = new THREE.Color(), cHor = new THREE.Color(), cSun = new THREE.Color(), tmpC = new THREE.Color();
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(), P3 = new THREE.Vector3(), E = new THREE.Euler();

  return (t) => {
    const c = cA(t);
    cam.position.set(c[0] + Math.sin(t * .29) * .18, c[1] + Math.sin(t * .23) * .12, c[2] + Math.cos(t * .31) * .18);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);
    sky.position.copy(cam.position);

    // mood: sky, fog, sun
    const w = moodW(t); cTop.setRGB(0, 0, 0); cHor.setRGB(0, 0, 0); cSun.setRGB(0, 0, 0); let si = 0;
    w.forEach((wt, i) => { if (!wt) return; cTop.add(tmpC.set(MOOD[i][0]).multiplyScalar(wt)); cHor.add(tmpC.set(MOOD[i][1]).multiplyScalar(wt)); cSun.add(tmpC.set(MOOD[i][2]).multiplyScalar(wt)); si += MOOD[i][3] * wt; });
    skyU.uTop.value.copy(cTop); skyU.uHor.value.copy(cHor); skyU.uStar.value = w[0] + w[1] + 0.5 * w[6];
    scene.background.copy(cHor); scene.fog.color.copy(cHor).lerp(cTop, 0.3);
    scene.fog.density = 0.006 + 0.004 * w[3] + 0.006 * w[4];
    sunL.color.copy(cSun); sunL.intensity = 1.7 * si;
    hemi.intensity = 0.35 + 0.35 * si + 0.2 * w[0];
    sunL.position.set(look.x - 18, 34, look.z + 22); sunL.target.position.copy(look);
    nrm.offset.set(t * 0.012, t * 0.02);
    bp.strength = 0.32 + 0.25 * w[0] + 0.2 * w[1];

    // ---- zone A: cows. s1 hook: eaten. s2: rebuilt as the king tells it, eaten again.
    const s2 = t >= K.s2 - 0.05;
    const tEat = s2 ? A("s2:dimakan") : A("s1:dimakan");
    for (let i = 0; i < 7; i++) {
      const f = FAT[i], l = LEAN[i], d = i * 0.07;
      const rise = s2 ? back((t - A("s2:menceritakan") - d) / 0.7) : 1;
      const eat = ramp(t, tEat + 0.2 + d, tEat + 1.3 + d);
      f.position.y = 0.17 - 3.2 * eat - 3.2 * (1 - rise);
      f.scale.set(1, Math.max(0.0001, 1 - 0.4 * eat), 1);
      f.visible = eat < 0.999 && rise > 0.001;
      const lIn = s2 ? ramp(t, A("s2:sapi") + d, A("s2:sapi") + 0.6 + d) : 1;
      const lStep = ramp(t, tEat + d, tEat + 1.1 + d);
      const gone = s2 ? 0 : ramp(t, K.s1e - 0.5, K.s1e);
      l.position.z = -4.2 + 5.4 * lStep;
      l.position.y = 0.17 - 3 * (1 - lIn) - 3 * gone + Math.abs(Math.sin(t * 7 + i)) * 0.06 * (lStep > 0 && lStep < 1 ? 1 : 0);
      l.visible = lIn > 0.001 && gone < 0.999;
      l.rotation.z = Math.sin(t * 9 + i) * 0.03 * (lStep > 0 && lStep < 1 ? 1 : 0);
    }
    mWire.emissiveIntensity = 0.4 + 0.6 * w[0];
    for (const e of EARS) {
      const a = e.green ? A("s2:tangkai") : A("s2:lainnya");
      const g = back((t - a - e.k * 0.08) / 0.55) * (1 - ramp(t, A("s2:Para") - 0.2, A("s2:Para") + 0.5));
      e.G.scale.set(1, Math.max(0.0001, g), 1); e.G.visible = g > 0.001 && t < K.s3 + 1;
      e.G.rotation.z = Math.sin(t * 1.2 + e.k) * 0.04;
    }
    const shrug = ramp(t, A("s2:angkat"), A("s2:angkat") + 0.5) * (1 - ramp(t, A("s2:kosong") + 0.4, A("s2:kosong") + 1.0));
    COURT.forEach((cc, i) => {
      cc.G.visible = t > K.s2 - 0.1 && t < K.s3 + 1;
      cc.arms.forEach(([piv, s]) => { piv.rotation.x = s * (0.12 + 1.15 * clamp01(shrug * 1.1 - cc.ph)); });
      cc.G.position.y = 0.17 + 0.05 * Math.sin(t * 2 + i) * shrug;
    });
    // dream dust: gold motes around the tableau, they scatter at "mimpi kosong"
    const scatter = ramp(t, A("s2:kosong"), A("s2:kosong") + 1.6);
    for (let i = 0; i < 360; i++) {
      const s = ddSeed[i], ang = s[0] * 6.28 + t * (0.1 + s[3] * 0.1), rr = 4 + s[1] * 9 + scatter * 10 * s[2];
      dreamDust.pos[i * 3] = XA + Math.cos(ang) * rr; dreamDust.pos[i * 3 + 1] = 0.6 + s[2] * 6 + Math.sin(t * .6 + s[0] * 9) * 0.4 + scatter * 3 * s[1]; dreamDust.pos[i * 3 + 2] = 1.5 + Math.sin(ang) * rr * 0.7;
      if (t > K.s3 + 1) dreamDust.pos[i * 3 + 1] = -50;
    }
    dreamDust.m.opacity = 0.85 * (1 - scatter * 0.8);
    dreamDust.commit();

    // ---- zone B: window light, the plan writing itself, the bowing stars
    const lightOn = ramp(t, A("s3:teringat"), A("s3:penjara") + 0.4) * (1 - ramp(t, K.s4 - 0.4, A("s4:Yusuf") + 0.3));
    beamM.opacity = 0.12 * lightOn; patchM.opacity = 0.16 * lightOn; winL.intensity = 60 * lightOn;
    // pen writes four rows during "Yusuf menjawab dengan sebuah rencana. Bercocok..."
    const w0 = A("s4:Yusuf"), w1 = A("s4:Bercocok") + 0.4;
    let px = SCX + 2.2, pz = SCZ + 0.9, py = 0.75, lift = 1;
    COVERS.forEach((cv, k) => {
      const a = w0 + (w1 - w0) * k / 4, b = w0 + (w1 - w0) * (k + 0.85) / 4;
      const u = ramp(t, a, b);
      const left = SCX - SCW / 2 + SCW * u, wd = Math.max(0.0001, SCW * (1 - u));
      cv.scale.x = wd; cv.position.x = left + wd / 2; cv.visible = u < 0.999;
      if (t >= a - 0.12 && t <= b + 0.1) { px = left; pz = cv.position.z; py = 0.12 + Math.abs(Math.sin(t * 22)) * 0.05; lift = 0; }
    });
    const penShow = ramp(t, A("s3:penjara") - 0.2, A("s3:penjara") + 0.6) * (1 - ramp(t, K.s4e - 0.2, K.s4e + 0.3));
    pen.visible = penShow > 0.01 && t < K.s5;
    pen.position.set(px, py + lift * (0.6 + Math.sin(t * 1.4) * 0.08), pz);
    pen.rotation.set(0.35, 0, lift ? -0.5 : -0.28);
    // stars, sun, moon appear in order, then bow toward the scroll
    const bow = ramp(t, A("s3:bersujud"), A("s3:bersujud") + 1.1);
    const skyOn = 1 - ramp(t, K.s4 + 0.6, K.s4 + 1.6);
    arcG.visible = t > A("s3:sebelas") - 0.2 && skyOn > 0.01;
    SKY.forEach((s) => {
      const g = back((t - A("s3:sebelas") - s.k * 0.06) / 0.5) * skyOn;
      s.m.position.copy(s.m.userData.p); s.m.position.y += Math.sin(t * 1.5 + s.k) * 0.06;
      s.m.scale.setScalar(Math.max(0.0001, g)); s.m.rotation.set(-bow * 0.9, t * 0.8 + s.k, 0);
    });
    const gS = back((t - A("s3:matahari")) / 0.6) * skyOn, gM = back((t - A("s3:bulan")) / 0.6) * skyOn;
    sunD.position.copy(sunD.userData.p); sunD.scale.setScalar(Math.max(0.0001, gS));
    moonD.position.copy(moonD.userData.p); moonD.scale.setScalar(Math.max(0.0001, gM)); moonD.rotation.set(-bow * 0.9, -0.4, 0.3);
    arcG.rotation.x = 0.52 * bow; arcG.position.y = -0.8 * bow;
    mStar.emissiveIntensity = 1.6 + 0.8 * bow;

    // ---- zone C: year columns
    let si2 = 0;
    SH.forEach((s, n) => {
      const a = s.t + s.k * 0.05;
      const drop = clamp01((t - a) / 0.42);
      const y = 0.22 + s.k * U + 3.2 * (1 - eout(drop)) - (drop > 0.85 ? 0 : 0) + (drop >= 1 ? 0 : 0);
      const bounce = drop >= 1 ? 0.05 * Math.max(0, Math.sin((t - a - 0.42) * 18)) * Math.exp(-(t - a - 0.42) * 8) : 0;
      S3.setScalar(t >= a ? 1 : 0.0001);
      E.set(0, s.i * 0.7 + s.k * 1.3, 0); Q.setFromEuler(E);
      M4.compose(P3.set(colX(s.i), y + bounce, 0), Q, S3); sheaves.setMatrixAt(n, M4); si2++;
    });
    sheaves.instanceMatrix.needsUpdate = true;
    PLATES.forEach((p, i) => { const g = back((t - YT[i] + 0.25) / 0.4); p.scale.set(Math.max(0.0001, g), 1, Math.max(0.0001, g)); p.visible = g > 0.001; });
    CAGES.forEach((G, j) => { const g = ramp(t, DY[j] - 0.25, DY[j] + 0.35); G.scale.set(1, Math.max(0.0001, g), 1); G.visible = g > 0.001; });
    const dg = back((t - DY[6]) / 0.5); dish.scale.setScalar(Math.max(0.0001, dg)); dish.visible = dg > 0.001;
    seedM.emissiveIntensity = 1.4 * ramp(t, A("s5:bibit") - 0.4, A("s5:bibit") + 0.4) + 0.4 * ramp(t, RY + 1, RY + 2.5);
    const S = stock(t);
    SILOS.forEach((f) => { const h = Math.max(0.05, 7.4 * S / 7); f.scale.y = h; f.position.y = h / 2 + 0.02; f.visible = t > HY[0] - 1 && S > 0.01; });
    // grain pour into the silos while the harvest years land, a trickle out while drought years drain
    const pourOn = ramp(t, HY[0] - 0.2, HY[0] + 0.3) * (1 - ramp(t, HY[6] + 0.6, HY[6] + 1.2));
    for (let i = 0; i < 500; i++) {
      const s = pSeed[i], sx = i % 2 ? 29 : 11;
      const ph = (t * (1.3 + s[1] * 0.4) + s[0]) % 1;
      pour.pos[i * 3] = sx + (s[2] - .5) * 0.6; pour.pos[i * 3 + 1] = pourOn > 0.01 ? 12.5 - ph * 9 : -60; pour.pos[i * 3 + 2] = -6 + (s[1] - .5) * 0.6;
    }
    pour.m.opacity = 0.95 * pourOn; pour.commit();
    // cursor follows the current year
    let ci = 0; for (let i = 0; i < 15; i++) if (t >= YT[i] - 0.25) ci = i;
    const ciF = ci + (ci < 14 ? clamp01((t - YT[ci]) / Math.max(0.1, YT[ci + 1] - YT[ci])) * 0 : 0);
    cursor.position.set(colX(ciF), 0.26, 0); cursor.visible = t > YT[0] - 0.3 && t < A("s6:Mimpi");
    cursor.material.color.set(ci < 7 ? 0xffd36a : ci < 14 ? 0xdfe6ee : 0x7fb0ff);
    // loose heap dulls while the sheaf keeps its shine (Ibnu Katsir note)
    const dull = ramp(t, A("s5:supaya"), A("s5:lama"));
    heapM.color.setRGB(0.85 - 0.45 * dull, 0.65 - 0.33 * dull, 0.25 - 0.08 * dull); heapM.metalness = 0.3 - 0.25 * dull; heapM.roughness = 0.6 + 0.35 * dull;
    const hv = ramp(t, A("s4:tangkainya") - 0.3, A("s4:tangkainya") + 0.3) * (1 - ramp(t, A("s5:Karena") + 0.6, A("s5:Karena") + 1.2));
    heap.scale.setScalar(Math.max(0.0001, hv)); loose.scale.setScalar(Math.max(0.0001, hv)); heap.visible = loose.visible = hv > 0.001;
    // rain over the timeline, then grapes and the press
    const rainOn = ramp(t, RY - 0.4, RY + 0.4) * (1 - ramp(t, A("s6:memeras") + 0.2, A("s6:Mimpi")));
    for (let i = 0; i < 900; i++) {
      const s = rSeed[i], ph = (t * (2.4 + s[2]) + s[0]) % 1;
      rain.pos[i * 3] = colX(8) + (s[1] - .5) * 30 - ph * 1.2; rain.pos[i * 3 + 1] = rainOn > 0.01 ? 14 - ph * 14 : -60; rain.pos[i * 3 + 2] = (s[2] - .5) * 14;
    }
    rain.m.opacity = 0.8 * rainOn; rain.commit();
    const vg = back((t - (RY + 0.5)) / 0.7);
    vine.scale.set(1, Math.max(0.0001, vg), 1); vine.visible = vg > 0.001;
    GR.forEach((g, k) => { const s = back((t - A("s6:kembali") - k * 0.15) / 0.5); g.scale.setScalar(Math.max(0.0001, s)); });
    const jf = ramp(t, A("s6:memeras"), A("s6:anggur") + 0.6);
    press.visible = juice.visible = t > RY + 0.6;
    press.scale.setScalar(Math.max(0.0001, back((t - RY - 0.6) / 0.5)));
    juice.position.y = 0.25 + 0.38 * jf; juice.scale.setScalar(0.75 + 0.25 * jf); juice.visible = jf > 0.01;
    for (let i = 0; i < 120; i++) {
      const s = spSeed[i], col = Math.floor(s[0] * 15), g = ramp(t, RY + 0.8 + s[1] * 1.2, RY + 1.6 + s[1] * 1.2);
      S3.setScalar(Math.max(0.0001, g)); Q.identity();
      M4.compose(P3.set(colX(col) + (s[1] - .5) * 2.2, 0.25 * g, 1.4 + s[2] * 1.4), Q, S3); sprouts.setMatrixAt(i, M4);
    }
    sprouts.instanceMatrix.needsUpdate = true;
    // the payoff: small cows hover over the years they stood for
    MINI.forEach((m, i) => {
      const a = A("s6:Mimpi") + 0.3 + (i % 7) * 0.08 + (i >= 7 ? 0.35 : 0);
      const g = back((t - a) / 0.55) * (1 - ramp(t, K.s7 + 0.4, K.s7 + 1.2));
      m.scale.setScalar(Math.max(0.0001, 0.62 * g)); m.visible = g > 0.001;
      m.position.set(colX(i) - 0.2, 7 * U + 1.2 + Math.sin(t * 1.6 + i) * 0.1, 0);
      m.rotation.y = -0.5;
    });

    // ---- zone D: gate, cleared name, treasury
    const clear = ramp(t, A("s7:terbukti"), A("s7:bersalah") + 0.4);
    blotM.opacity = 1 - clear; nameS.material.emissiveIntensity = 0.12 + 0.18 * clear;
    const open = ramp(t, A("s7:meminta") - 0.4, A("s7:jadikan") + 0.4);
    DOORS.forEach(([piv, s]) => { piv.rotation.y = s * -1.7 * open; });
    glow.material.opacity = 0.25 * ramp(t, K.s7, A("s7:menolak")) * (1 - open) + 0.18 * open * (1 - ramp(t, A("s7:bendaharawan"), A("s7:bendaharawan") + 0.6));
    vLamp.intensity = 16 * open;
    const kr = back((t - A("s7:bendaharawan") + 0.3) / 0.7), kt = ramp(t, A("s7:negeri"), A("s7:negeri") + 0.8);
    key.visible = kr > 0.001;
    key.position.set(XD, 1.25 + 1.3 * eout(kr) - 0.5 * ramp(t, A("s7:menjaga"), A("s7:berpengetahuan")), -5.0);
    key.rotation.set(Math.PI * 2 * kt * 0.25 + Math.sin(t * 1.3) * 0.05, 0.4, 0);
    key.scale.setScalar(Math.max(0.0001, kr));
    for (let i = 0; i < 300; i++) {
      const s = mSeed[i];
      motes.pos[i * 3] = XD + (s[0] - .5) * 9; motes.pos[i * 3 + 1] = 0.5 + ((s[1] * 8 + t * 0.15 * (0.5 + s[2])) % 8); motes.pos[i * 3 + 2] = -3 - s[2] * 9;
    }
    motes.m.opacity = 0.7 * open; motes.commit();

    comp.render();
  };
}

// six box faces with the +z face invisible, so the treasury is seen through its gate
function openFront(m) { const hid = new THREE.MeshBasicMaterial({ visible: false }); return [m, m, m, m, hid, m]; }
function mLapisMat() { return new THREE.MeshStandardMaterial({ color: 0x1f3a8a, metalness: 0.4, roughness: 0.3 }); }
