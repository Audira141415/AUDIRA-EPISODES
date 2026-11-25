// EP10 PAPERWORLD: a cardstock diorama on a desk under a warm lamp. Three stations on one table:
// V  the Vatican (basilica, colonnade, walls, the raised Passetto to Castel Sant'Angelo, the Borgo houses),
// M  a folded paper map of the Alps and Italy for the 1505-06 march, and
// D  a courtyard for the oath, the height ruler and the uniform swatches.
// Station changes happen under a full-screen paper fold (HTML), so the camera never crosses empty desk.
// Guards, invaders and the pope are flat paper cutouts. Everything is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, pts, back } from "./lib3d.js";
import { GEO } from "./geo.js";

const CARD = "#F2EADB", TRAV = "#D9CBB0", BLUE = "#1F3A93", RED = "#C8102E", YEL = "#F2B705", SH = "#5A4A3A";

// Hermite track with harmonic-mean tangents: never overshoots a station.
function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}

// Tilt-shift: separable blur whose radius grows away from a horizontal focus band.
const TILT = {
  uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2(1 / 1080, 0) }, focus: { value: 0.5 }, band: { value: 0.16 }, amt: { value: 1.0 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: "uniform sampler2D tDiffuse;uniform vec2 dir;uniform float focus,band,amt;varying vec2 vUv;void main(){float d=max(0.,abs(vUv.y-focus)-band);float r=clamp(d*22.,0.,5.)*amt;vec4 s=vec4(0.);float w=0.;for(int i=-6;i<=6;i++){float f=float(i);float k=exp(-f*f/14.);s+=texture2D(tDiffuse,vUv+dir*f*r)*k;w+=k;}gl_FragColor=s/w;}",
};

// ---------- paper cutout art ----------
function stripes(g, x, y, w, h, cols, sw) {
  let k = 0;
  for (let xx = x; xx < x + w; xx += sw) { g.fillStyle = cols[k++ % cols.length]; g.fillRect(xx, y, sw + 0.5, h); }
}
function poly(g, p) { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }
// pal: {a,b,c} stripe colours, skin, metal, plume, shoe, weapon: 'halberd' | 'pike' | null
function drawFigure(g, pose, pal) {
  const S = [pal.a, pal.b, pal.c];
  const pole = (x0, y0, x1, y1, w = 6) => { g.strokeStyle = "#6B4A2A"; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  // weapon behind the body
  if (pal.weapon === "halberd" && pose !== "oath") {
    const x = pose === "walk" ? 206 : 204;
    pole(x, 34, x, 496);
    g.fillStyle = pal.metal;
    poly(g, [[x, 6], [x + 6, 40], [x - 6, 40]]); g.fill();
    poly(g, [[x + 2, 44], [x + 40, 36], [x + 46, 62], [x + 40, 86], [x + 2, 78]]); g.fill();
    poly(g, [[x - 2, 50], [x - 26, 58], [x - 2, 70]]); g.fill();
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; poly(g, [[x + 2, 44], [x + 40, 36], [x + 46, 62], [x + 40, 86], [x + 2, 78]]); g.stroke();
  }
  if (pal.weapon === "pike") { pole(206, 0, 206, 496, 5); g.fillStyle = pal.metal; poly(g, [[206, 0], [213, 26], [199, 26]]); g.fill(); }
  // legs
  const leg = (hx, fx) => {
    g.save(); poly(g, [[hx - 13, 350], [hx + 13, 350], [fx + 11, 474], [fx - 11, 474]]); g.clip();
    stripes(g, Math.min(hx, fx) - 20, 340, 60, 140, [pal.b, pal.a], 13); g.restore();
    g.fillStyle = pal.shoe; g.beginPath(); g.ellipse(fx + 3, 484, 20, 12, 0, 0, 7); g.fill();
  };
  if (pose === "walk") { leg(112, 90); leg(146, 168); } else { leg(112, 108); leg(146, 150); }
  // breeches
  g.save(); g.beginPath(); g.ellipse(129, 316, 50, 48, 0, 0, 7); g.clip(); stripes(g, 76, 262, 110, 110, S, 13); g.restore();
  // doublet
  g.save(); poly(g, [[82, 172], [176, 172], [168, 290], [90, 290]]); g.clip(); stripes(g, 80, 166, 100, 130, S, 14);
  g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(150, 166, 40, 130); g.restore();
  g.fillStyle = "#3A2A1C"; g.fillRect(88, 278, 82, 10);
  // left arm (hangs)
  g.save(); poly(g, [[82, 174], [62, 182], [56, 296], [80, 298], [92, 196]]); g.clip(); stripes(g, 50, 170, 50, 132, S, 12); g.restore();
  g.fillStyle = pal.skin; g.beginPath(); g.arc(68, 306, 11, 0, 7); g.fill();
  // right arm
  if (pose === "oath") {
    g.save(); poly(g, [[170, 174], [186, 170], [204, 82], [184, 78]]); g.clip(); stripes(g, 168, 70, 50, 110, S, 12); g.restore();
    g.fillStyle = pal.skin; g.beginPath(); g.arc(195, 68, 12, 0, 7); g.fill();
    g.fillRect(186, 34, 6, 30); g.fillRect(194, 30, 6, 32); g.fillRect(202, 36, 6, 28);
  } else {
    const hx = pose === "walk" ? 202 : 200;
    g.save(); poly(g, [[170, 174], [190, 178], [hx + 4, 246], [hx - 14, 252]]); g.clip(); stripes(g, 166, 170, 50, 90, S, 12); g.restore();
    g.fillStyle = pal.skin; g.beginPath(); g.arc(hx, 252, 11, 0, 7); g.fill();
  }
  // collar and head
  g.fillStyle = "#FBF7EE"; g.beginPath(); g.ellipse(129, 168, 34, 9, 0, 0, 7); g.fill();
  g.fillStyle = pal.skin; g.beginPath(); g.arc(129, 138, 23, 0, 7); g.fill();
  g.fillStyle = "rgba(0,0,0,.14)"; g.beginPath(); g.arc(136, 140, 21, -1.2, 1.4); g.fill();
  // morion helmet and plume
  g.fillStyle = pal.plume; for (const [x, y, r] of [[136, 78, 15], [150, 84, 13], [124, 82, 12], [160, 96, 11], [142, 68, 11]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.fillStyle = pal.metal; g.beginPath(); g.ellipse(129, 114, 27, 20, 0, Math.PI, 0); g.fill();
  poly(g, [[84, 100], [96, 118], [162, 118], [174, 100], [166, 112], [92, 112]]); g.fill();
  g.fillRect(90, 112, 78, 8);
  poly(g, [[110, 96], [129, 80], [148, 96]]); g.fill();
  g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(120, 104, 8, 5, -0.4, 0, 7); g.fill();
}
function drawPope(g) {
  g.fillStyle = "#FBF8F0"; poly(g, [[98, 168], [160, 168], [186, 494], [72, 494]]); g.fill();
  g.strokeStyle = "rgba(90,74,58,.35)"; g.lineWidth = 2; for (const x of [110, 129, 148]) { g.beginPath(); g.moveTo(x, 230); g.lineTo(x + (x - 129) * 0.4, 490); g.stroke(); }
  g.fillStyle = "#A3122A"; g.beginPath(); g.ellipse(129, 190, 46, 34, 0, Math.PI, 0); g.fill(); g.fillRect(83, 188, 92, 26);
  g.fillStyle = "#E8C25A"; g.fillRect(126, 214, 6, 34); g.fillRect(117, 224, 24, 6);
  g.fillStyle = "#E9C9A8"; g.beginPath(); g.arc(129, 138, 23, 0, 7); g.fill();
  g.fillStyle = "#FBF8F0"; g.beginPath(); g.ellipse(129, 120, 21, 10, 0, Math.PI, 0); g.fill();
  g.fillStyle = "#E9C9A8"; g.beginPath(); g.arc(70, 300, 10, 0, 7); g.arc(188, 300, 10, 0, 7); g.fill();
}
// Composite a figure onto a cardstock border so it reads as a cut-out.
function cutoutTex(draw, w = 256, h = 512, edge = 6, edgeCol = CARD) {
  return canvasTex(w, h, (g) => {
    const a = document.createElement("canvas"); a.width = w; a.height = h;
    draw(a.getContext("2d"));
    const b = document.createElement("canvas"); b.width = w; b.height = h;
    const bg = b.getContext("2d");
    for (let i = 0; i < 20; i++) { const an = (i / 20) * Math.PI * 2; bg.drawImage(a, Math.cos(an) * edge, Math.sin(an) * edge); }
    bg.globalCompositeOperation = "source-in"; bg.fillStyle = edgeCol; bg.fillRect(0, 0, w, h);
    g.drawImage(b, 0, 0); g.drawImage(a, 0, 0);
  });
}

function dyn(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  return { g: c.getContext("2d"), tx, c };
}

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x2a1d14, fog: 0.0036, exp: 1.0, bloom: [0.16, 0.5, 0.9] });
  const tiltH = new ShaderPass(TILT), tiltV = new ShaderPass(TILT);
  tiltV.uniforms.dir.value.set(0, 1 / 1920);
  comp.insertPass(tiltH, 2); comp.insertPass(tiltV, 3);
  const rnd = mulberry(1506);
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0x6a4a30, 1.05);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd9a8, 1.7);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 300 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  // ---------- materials ----------
  const fiber = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
    const q = mulberry(11);
    for (let i = 0; i < 2600; i++) { g.strokeStyle = `rgba(120,100,70,${0.03 + q() * 0.05})`; g.lineWidth = 0.6 + q() * 0.8; const x = q() * w, y = q() * h, a = q() * 6.28, l = 3 + q() * 14; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(110,90,60,${q() * 0.05})`; g.fillRect(q() * w, q() * h, 1.4, 1.4); }
  }, [3, 3]);
  const pm = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, map: fiber, roughness: 0.93, flatShading: true, ...extra });
  const mCard = pm(CARD), mTrav = pm(TRAV), mShade = pm("#C9B898"), mRoof = pm("#B85B3E"), mDark = pm("#8C7660");
  const add = (geo, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);

  // canvas labels redrawn once web fonts are ready
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  let fontsOk = false;

  // ---------- desk ----------
  const deskT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#4a3324"; g.fillRect(0, 0, w, h);
    const q = mulberry(7);
    for (let i = 0; i < 240; i++) { const y0 = q() * h; g.strokeStyle = q() < 0.5 ? `rgba(120,84,52,${0.05 + q() * 0.1})` : `rgba(20,10,4,${0.08 + q() * 0.12})`; g.lineWidth = 1 + q() * 4; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.004 + i) * 12); g.stroke(); }
  }, [8, 4]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(900, 420), new THREE.MeshStandardMaterial({ map: deskT, roughness: 0.75 }));
  desk.rotation.x = -Math.PI / 2; desk.position.set(0, -1.05, 0); desk.receiveShadow = true; scene.add(desk);
  // a cardstock backdrop sweep behind the Vatican so dark cut-outs read against it
  const sweep = new THREE.Mesh(new THREE.PlaneGeometry(520, 180), new THREE.MeshStandardMaterial({ color: 0xe8dcc4, map: fiber, roughness: 0.95 }));
  sweep.position.set(10, 70, -125); sweep.receiveShadow = true; scene.add(sweep);
  // paper scraps and offcuts on the desk between stations
  for (let i = 0; i < 60; i++) {
    const x = -300 + rnd() * 600, z = -120 + rnd() * 240;
    if (Math.abs(x) < 110 && z > -60 && z < 60) continue;
    const s = B(4 + rnd() * 10, 0.08, 3 + rnd() * 8, [mCard, mTrav, pm(BLUE), pm(RED), pm(YEL)][i % 5], x, -0.98, z);
    s.rotation.y = rnd() * 3;
  }

  // ======================= STATION V: the Vatican =======================
  B(150, 1, 100, mTrav, 30, -0.5, 4);
  // piazza and paving
  const pavT = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = "#EFE5D2"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "rgba(90,74,58,.35)"; g.lineWidth = 3;
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, w / 2); g.lineTo(w / 2 + Math.cos(a) * w, w / 2 + Math.sin(a) * w); g.stroke(); }
    for (const rr of [80, 200, 330, 470]) { g.beginPath(); g.arc(w / 2, w / 2, rr, 0, 7); g.stroke(); }
  });
  const piazza = add(new THREE.CylinderGeometry(1, 1, 0.12, 48), new THREE.MeshStandardMaterial({ map: pavT, roughness: 0.95 }), 0, 0.06, 16);
  piazza.scale.set(17, 1, 14);
  B(30, 0.1, 12, pm("#EDE2CC"), 0, 0.05, 4);
  // obelisk
  B(0.9, 8, 0.9, mCard, 0, 4, 16); add(new THREE.ConeGeometry(0.64, 1, 4), mCard, 0, 8.5, 16).rotation.y = Math.PI / 4; B(1.8, 0.8, 1.8, mShade, 0, 0.4, 16);
  // colonnade: two arcs, two rows, roof segments and tiny statues
  const colGeo = new THREE.CylinderGeometry(0.42, 0.46, 5, 7);
  const colPos = [];
  for (const [a0, a1] of [[Math.PI * 0.62, Math.PI * 1.38], [-Math.PI * 0.38, Math.PI * 0.38]]) for (const rad of [15, 16.6]) for (let i = 0; i <= 16; i++) { const a = a0 + (a1 - a0) * (i / 16); colPos.push([Math.cos(a) * rad, 16 + Math.sin(a) * rad * 0.85]); }
  const cols = new THREE.InstancedMesh(colGeo, mCard, colPos.length); cols.castShadow = cols.receiveShadow = true;
  const dmy = new THREE.Object3D(); dmy.rotation.order = "YXZ";
  colPos.forEach(([x, z], i) => { dmy.position.set(x, 2.5, z); dmy.rotation.set(0, 0, 0); dmy.scale.setScalar(1); dmy.updateMatrix(); cols.setMatrixAt(i, dmy.matrix); });
  scene.add(cols);
  const statG = new THREE.CylinderGeometry(0.14, 0.24, 1.1, 5);
  const stat = new THREE.InstancedMesh(statG, mCard, 34); stat.castShadow = true;
  let si = 0;
  for (const [a0, a1] of [[Math.PI * 0.62, Math.PI * 1.38], [-Math.PI * 0.38, Math.PI * 0.38]]) {
    for (let i = 0; i < 16; i++) {
      const a = a0 + (a1 - a0) * ((i + 0.5) / 16), rad = 15.8, x = Math.cos(a) * rad, z = 16 + Math.sin(a) * rad * 0.85;
      const nx = Math.cos(a0 + (a1 - a0) * ((i + 1) / 16)) * rad, nz = 16 + Math.sin(a0 + (a1 - a0) * ((i + 1) / 16)) * rad * 0.85;
      const px = Math.cos(a0 + (a1 - a0) * (i / 16)) * rad, pz = 16 + Math.sin(a0 + (a1 - a0) * (i / 16)) * rad * 0.85;
      const seg = B(Math.hypot(nx - px, nz - pz) + 0.3, 0.8, 3.2, mShade, x, 5.4, z); seg.rotation.y = -Math.atan2(nz - pz, nx - px);
      if (si < 34) { dmy.position.set(x, 6.35, z); dmy.updateMatrix(); stat.setMatrixAt(si++, dmy.matrix); }
    }
  }
  stat.count = si; scene.add(stat);
  // basilica facade (drawn in pencil on cardstock)
  const facT = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = CARD; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(90,74,58,.10)"; g.fillRect(0, 0, w, 70);
    g.strokeStyle = "rgba(70,55,40,.75)"; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
    g.beginPath(); g.moveTo(0, 70); g.lineTo(w, 70); g.moveTo(0, 96); g.lineTo(w, 96); g.stroke();
    for (let i = 0; i < 9; i++) { const x = 40 + i * 118; g.fillStyle = "rgba(90,74,58,.13)"; g.fillRect(x, 96, 36, h - 96); g.strokeStyle = "rgba(70,55,40,.6)"; g.lineWidth = 2; g.strokeRect(x, 96, 36, h - 96); }
    for (let i = 0; i < 8; i++) {
      const x = 99 + i * 118;
      g.fillStyle = SH; g.beginPath(); g.moveTo(x - 22, 300); g.lineTo(x - 22, 230); g.arc(x, 230, 22, Math.PI, 0); g.lineTo(x + 22, 300); g.fill();
      g.fillStyle = "#3a2c20"; g.beginPath(); g.moveTo(x - 30, h - 6); g.lineTo(x - 30, 410); g.arc(x, 410, 30, Math.PI, 0); g.lineTo(x + 30, h - 6); g.fill();
      g.fillStyle = "rgba(60,45,30,.6)"; g.fillRect(x - 18, 120, 36, 26);
    }
    g.strokeStyle = "rgba(70,55,40,.8)"; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 - 170, 96); g.lineTo(w / 2, 20); g.lineTo(w / 2 + 170, 96); g.stroke();
  });
  const facM = [mCard, mCard, mCard, mCard, new THREE.MeshStandardMaterial({ map: facT, roughness: 0.93 }), mCard];
  const fac = add(new THREE.BoxGeometry(26, 12, 1.6), facM, 0, 6, 0);
  for (let i = 0; i < 13; i++) add(new THREE.CylinderGeometry(0.16, 0.26, 1.3, 5), mCard, -12 + i * 2, 12.65, 0.2);
  B(25, 10.5, 28, mShade, 0, 5.25, -15);
  const nave = add(new THREE.CylinderGeometry(5, 5, 26, 3), mRoof, 0, 10.4, -15); nave.rotation.x = Math.PI / 2; nave.rotation.y = Math.PI; nave.scale.set(2.4, 1, 0.5);
  B(44, 10, 9, mShade, 0, 5, -20);
  const drumT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = CARD; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { const x = 32 + i * 64; g.fillStyle = SH; g.fillRect(x - 10, 40, 20, 56); g.beginPath(); g.arc(x, 40, 10, Math.PI, 0); g.fill(); g.fillStyle = "rgba(90,74,58,.25)"; g.fillRect(x + 22, 0, 8, h); } });
  add(new THREE.CylinderGeometry(6.4, 6.4, 4.4, 16), new THREE.MeshStandardMaterial({ map: drumT, roughness: 0.93, flatShading: true }), 0, 12.6, -20);
  B(14, 1, 14, mShade, 0, 10.6, -20);
  const dome = add(new THREE.SphereGeometry(6.4, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), pm("#E9DFCB"), 0, 14.8, -20); dome.scale.y = 1.32;
  add(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 8), mCard, 0, 24.3, -20);
  add(new THREE.ConeGeometry(1.2, 1.4, 8), mCard, 0, 26.1, -20);
  B(0.18, 1.4, 0.18, pm("#C9A24A"), 0, 27.4, -20); B(0.8, 0.18, 0.18, pm("#C9A24A"), 0, 27.6, -20);
  for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(2.2, 2.2, 1.6, 10), mCard, s * 11, 11, -12); const d = add(new THREE.SphereGeometry(2.2, 10, 4, 0, 7, 0, Math.PI / 2), pm("#E9DFCB"), s * 11, 11.8, -12); d.scale.y = 1.3; }
  // apostolic palace
  B(12, 11, 12, mCard, 18, 5.5, -16);
  add(new THREE.ConeGeometry(8.6, 3, 4), mRoof, 18, 12.5, -16).rotation.y = Math.PI / 4;
  // Vatican walls with crenels
  const wallPts = [[-26, -2], [-30, -28], [-12, -46], [16, -46], [28, -30], [24, -10]];
  for (let i = 0; i < wallPts.length - 1; i++) {
    const [x0, z0] = wallPts[i], [x1, z1] = wallPts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), a = -Math.atan2(z1 - z0, x1 - x0);
    B(L, 4, 1.6, mTrav, (x0 + x1) / 2, 2, (z0 + z1) / 2).rotation.y = a;
    for (let k = 0.5; k < L; k += 1.6) B(0.8, 0.8, 1.6, mTrav, x0 + ((x1 - x0) * k) / L, 4.4, z0 + ((z1 - z0) * k) / L).rotation.y = a;
  }
  // Passetto di Borgo: raised corridor on an arched wall, walkway on top at y = 6
  const PZ = -10, PX0 = 22, PX1 = 70;
  const archT = canvasTex(256, 64, (g, w, h) => { g.fillStyle = TRAV; g.fillRect(0, 0, w, h); g.fillStyle = "#6E5B47"; for (let i = 0; i < 4; i++) { const x = 32 + i * 64; g.fillRect(x - 14, 34, 28, 30); g.beginPath(); g.arc(x, 34, 14, Math.PI, 0); g.fill(); } g.strokeStyle = "rgba(90,74,58,.3)"; g.lineWidth = 2; for (let y = 6; y < 30; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [10, 1]);
  const archM = new THREE.MeshStandardMaterial({ map: archT, roughness: 0.93 });
  add(new THREE.BoxGeometry(PX1 - PX0, 6, 2.6), [mTrav, mTrav, mCard, mTrav, archM, archM], (PX0 + PX1) / 2, 3, PZ);
  for (let x = PX0 + 0.5; x < PX1; x += 1.5) { B(0.7, 0.7, 0.3, mTrav, x, 6.35, PZ - 1.15); B(0.7, 0.7, 0.3, mTrav, x, 6.35, PZ + 1.15); }
  // stair from the piazza up to the corridor
  for (let i = 0; i < 8; i++) B(3, 0.75 * (i + 1), 1.2, mCard, 17.4 + i * 0.6, 0.375 * (i + 1), -4 - i * 0.75);
  // Castel Sant'Angelo
  const CX = 80, CZ = -10;
  B(20, 4, 20, mTrav, CX, 2, CZ);
  const castT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#E3D6BC"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(90,74,58,.35)"; g.lineWidth = 2; for (let y = 10; y < h; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = SH; for (let i = 0; i < 10; i++) g.fillRect(20 + i * 50, 30, 10, 18); });
  add(new THREE.CylinderGeometry(8, 8.3, 9, 24), new THREE.MeshStandardMaterial({ map: castT, roughness: 0.93, flatShading: true }), CX, 8.5, CZ);
  B(8, 5, 8, mCard, CX, 15.5, CZ); add(new THREE.ConeGeometry(5.8, 2, 4), mRoof, CX, 19, CZ).rotation.y = Math.PI / 4;
  add(new THREE.CylinderGeometry(0.3, 0.5, 2.4, 6), pm("#9AA3A0"), CX, 21.2, CZ);
  // Tiber: a blue-grey paper ribbon south-east of the castle
  const tib = new THREE.Mesh(new THREE.PlaneGeometry(90, 9), pm("#9FB2B4", { flatShading: false }));
  tib.rotation.x = -Math.PI / 2; tib.rotation.z = 0.35; tib.position.set(96, 0.04, 18); tib.receiveShadow = true; scene.add(tib);
  // Borgo houses with pyramid roofs (the street z 6..22 stays open)
  const houses = [];
  for (let i = 0; i < 70 && houses.length < 46; i++) {
    const x = 30 + rnd() * 40, z = 25 + rnd() * 17;
    if (houses.some((h) => Math.hypot(h[0] - x, h[1] - z) < 4.2)) continue;
    const w = 2.6 + rnd() * 1.6, hh = 2 + rnd() * 2.6;
    B(w, hh, w, i % 3 ? mCard : mTrav, x, hh / 2, z);
    add(new THREE.ConeGeometry(w * 0.78, 1.4, 4), mRoof, x, hh + 0.7, z).rotation.y = Math.PI / 4;
    houses.push([x, z, hh + 1.4]);
  }

  // ---------- paper cutout crowds ----------
  const GPAL = { a: BLUE, b: YEL, c: RED, skin: "#E9C9A8", metal: "#8E959C", plume: RED, shoe: "#1E1A18", weapon: "halberd" };
  const IPAL = { a: "#5A4A3A", b: "#6E5E4E", c: "#4A3C2F", skin: "#7A6A5A", metal: "#857D75", plume: "#3C3026", shoe: "#2A221C", weapon: "pike" };
  const texStand = cutoutTex((g) => drawFigure(g, "stand", GPAL));
  const texWalk = cutoutTex((g) => drawFigure(g, "walk", GPAL));
  const texOath = cutoutTex((g) => drawFigure(g, "oath", GPAL));
  const texInv = cutoutTex((g) => drawFigure(g, "stand", IPAL), 256, 512, 6, "#BFAF96");
  const texPope = cutoutTex(drawPope);
  const cutMat = (tex) => new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.88 });
  const cutDepth = (tex) => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  const cutGeo = (h) => { const g = new THREE.PlaneGeometry(h * 0.5, h); g.translate(0, h / 2, 0); return g; };
  const crowd = (tex, n, h) => {
    const m = new THREE.InstancedMesh(cutGeo(h), cutMat(tex), n);
    m.customDepthMaterial = cutDepth(tex); m.castShadow = true; m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m;
  };
  const single = (tex, h) => { const m = new THREE.Mesh(cutGeo(h), cutMat(tex)); m.customDepthMaterial = cutDepth(tex); m.castShadow = true; m.rotation.order = "YXZ"; scene.add(m); return m; };
  const setI = (m, i, x, y, z, yaw, tilt, s, roll = 0) => { dmy.position.set(x, y, z); dmy.rotation.set(tilt, yaw, roll); dmy.scale.setScalar(s <= 0.001 ? 0.0001 : s); dmy.updateMatrix(); m.setMatrixAt(i, dmy.matrix); };

  const GH = 1.7;
  const guards = crowd(texStand, 189, GH);
  // hook: 135 in a 9 x 15 block in the piazza; 1527: 189 in 9 rows of 21 before the facade
  const hookPos = [], defPos = [];
  for (let i = 0; i < 189; i++) {
    const c = i % 9, rw = Math.floor(i / 9);
    hookPos.push([-6 + c * 1.5 + (rw % 2) * 0.2, 18 + rw * 1.3]);
    const c2 = i % 21, r2 = Math.floor(i / 21);
    defPos.push([-10 + c2 * 1.0 + (r2 % 2) * 0.5, 3.6 + r2 * 0.95]);
  }
  // who falls and who escapes (seeded)
  const order = [...Array(189).keys()];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const surv = new Map(); order.slice(0, 42).forEach((gi, k) => surv.set(gi, k));
  const fallT = new Map(); order.slice(42).forEach((gi, k) => fallT.set(gi, k / 147));

  // escape route: queue before the facade, stair, corridor top, castle
  const route = [[-7, 0, 4], [10, 0, 4], [16, 0, -4], [21.5, 6, -10], [PX1, 6, PZ]];
  const rLen = [0];
  for (let i = 1; i < route.length; i++) rLen.push(rLen[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1], route[i][2] - route[i - 1][2]));
  const RL = rLen[rLen.length - 1];
  const routeAt = (s) => {
    s = Math.max(0, Math.min(RL, s));
    let i = 1; while (i < rLen.length - 1 && rLen[i] < s) i++;
    const a = route[i - 1], b = route[i], u = (s - rLen[i - 1]) / (rLen[i] - rLen[i - 1]);
    const dx = b[0] - a[0], dz = b[2] - a[2], dl = Math.hypot(dx, dz) || 1;
    return [a[0] + dx * u, a[1] + (b[1] - a[1]) * u, a[2] + dz * u, -dz / dl, dx / dl];
  };
  const Q0 = 17;
  const sis = A("s5:Sisanya"), wk0 = A("s5:mengawal") - 0.2, wk1 = A("s6:Hingga") + 0.1;
  const walkH = (t) => { const u = clamp01((t - wk0) / (wk1 - wk0)); return (RL - Q0 - 0.2) * (u < 0.12 ? (u * u) / 0.24 : u - 0.06) / 0.94; };
  const pope = single(texPope, GH * 1.02);

  // invaders: 10 deep along x, 9 across the street
  const inv = crowd(texInv, 90, GH * 1.05);
  const invStart = [], invEnd = [];
  for (let i = 0; i < 90; i++) { const rw = Math.floor(i / 9), c = i % 9; const z = 8.5 + c * 1.6 + (rw % 2) * 0.4; invStart.push([40 + rw * 1.25, z]); invEnd.push([21 + rw * 1.25, z]); }

  // the implied great army: three cardstock flats hinged at their base behind the basilica
  const armyFlat = (seed, col, w, h) => canvasTex(2048, 640, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    const q = mulberry(seed);
    g.fillStyle = col;
    for (let row = 0; row < 3; row++) for (let x = -20; x < W + 20; x += 52 + q() * 22) {
      const hh = H * (0.55 + row * 0.12 + q() * 0.08), y0 = H, bw = 38 + q() * 10;
      g.fillRect(x, y0 - hh * 0.62, bw, hh * 0.62);
      g.beginPath(); g.arc(x + bw / 2, y0 - hh * 0.66, bw * 0.42, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x + bw / 2, y0 - hh * 0.72, bw * 0.75, bw * 0.22, 0, Math.PI, 0); g.fill();
      g.fillRect(x + bw + 3, y0 - hh * (0.98 + q() * 0.1), 4, hh);
      g.beginPath(); g.moveTo(x + bw + 5, y0 - hh * 1.14); g.lineTo(x + bw + 12, y0 - hh * 1.0); g.lineTo(x + bw - 2, y0 - hh * 1.0); g.fill();
    }
    g.fillRect(0, H - 40, W, 40);
  });
  const armies = [];
  for (const [i, [z, w, h, col]] of [[-58, 150, 46, "#5A4A3A"], [-74, 175, 58, "#4A3C2F"], [-92, 200, 70, "#3C3026"]].entries()) {
    const tx = armyFlat(40 + i, col, w, h);
    const geo = new THREE.PlaneGeometry(w, h * 1.2); geo.translate(0, h * 0.6, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tx, transparent: true, alphaTest: 0.4, roughness: 0.95, side: THREE.DoubleSide }));
    m.position.set((i - 1) * 6, 0, z); m.castShadow = true; scene.add(m); armies.push(m);
  }

  // paper flames on the Borgo, embers
  const flameTex = cutoutTex((g) => {
    const fl = (s, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(128, 500); g.bezierCurveTo(128 - 110 * s, 480, 128 - 100 * s, 300, 128 - 30 * s, 250 + (1 - s) * 120); g.bezierCurveTo(128 - 40 * s, 330, 128 - 10 * s, 330, 128, 40 + (1 - s) * 260); g.bezierCurveTo(128 + 20 * s, 250, 128 + 70 * s, 260, 128 + 60 * s, 160 + (1 - s) * 200); g.bezierCurveTo(128 + 120 * s, 300, 128 + 110 * s, 470, 128, 500); g.fill(); };
    fl(1, "#C8102E"); fl(0.72, "#E8601C"); fl(0.45, YEL);
  }, 256, 512, 5, "#F7E3C0");
  const flMat = new THREE.MeshStandardMaterial({ map: flameTex, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0xff7a2a, emissiveIntensity: 0.8, emissiveMap: flameTex });
  const NF = 34;
  const flames = new THREE.InstancedMesh(cutGeo(3.6), flMat, NF); flames.frustumCulled = false; scene.add(flames);
  const flSpots = [];
  const fh = houses.filter((h) => h[1] < 31); for (let i = 0; i < NF; i++) { const h = fh[i % fh.length]; flSpots.push([h[0] + (rnd() - 0.5) * 1.6, h[2] - 0.6, h[1] + (rnd() - 0.5) * 1.6, 0.7 + rnd() * 0.7, rnd() * 6, i / NF]); }
  const fireL1 = new THREE.PointLight(0xff7a2a, 0, 70, 1.4); fireL1.position.set(44, 12, 30); scene.add(fireL1);
  const fireL2 = new THREE.PointLight(0xff5a1a, 0, 70, 1.4); fireL2.position.set(52, 6, 32); scene.add(fireL2);
  const embers = pts(scene, 220, { color: 0xffa040, size: 0.35, add: true, opacity: 0.85 });
  const emSeed = [...Array(220)].map(() => [rnd(), rnd(), rnd(), rnd()]);

  // candles for the fallen
  const NC = 26;
  const candG = new THREE.CylinderGeometry(0.13, 0.13, 0.6, 8); candG.translate(0, 0.3, 0);
  const candles = new THREE.InstancedMesh(candG, pm("#FBF6EA", { emissive: 0x332211 }), NC); candles.castShadow = true; scene.add(candles);
  const candPos = [...Array(NC)].map((_, i) => [-10.5 + (i / (NC - 1)) * 21 + (rnd() - 0.5) * 0.3, 12.8 + (rnd() - 0.5) * 0.7]);
  const candFl = pts(scene, NC, { color: 0xffc070, size: 0.42, add: true, opacity: 0.8 });
  const candL = new THREE.PointLight(0xffb060, 0, 30, 1.6); candL.position.set(0, 2.2, 14); scene.add(candL);

  // ======================= STATION M: the paper map =======================
  const MX = -220, MZ = 0, MW = 60, MH = 66, MS = 8, CWm = 1600, CHm = 1760;
  const P = (lon, lat) => [(lon - 10) * Math.cos((44.5 * Math.PI) / 180) * MS, -(lat - 44.5) * MS];
  const Cm = (x, z) => [((x + MW / 2) / MW) * CWm, ((z + MH / 2) / MH) * CHm];
  const PC = (lon, lat) => Cm(...P(lon, lat));
  const fold = (x, z) => 0.38 * (1 - Math.abs(((((x + MW / 2) / MW) * 4) % 2) - 1)) + 0.22 * (1 - Math.abs(((((z + MH / 2) / MH) * 2) % 2) - 1));
  const ringPath = (g, name) => { g.beginPath(); for (const c of GEO) { if (name && c.name !== name) continue; for (const ring of c.rings) ring.forEach(([lo, la], i) => { const p = PC(lo, la); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); } g.closePath(); };
  const mapLabel = (g, txt, lon, lat, font, col, sp = 6, rot = 0) => { const [x, y] = PC(lon, lat); g.save(); g.translate(x, y); g.rotate(rot); g.font = font; g.letterSpacing = sp + "px"; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 0); g.restore(); };
  const ROUTE = [[8.31, 47.05], [8.64, 46.88], [8.57, 46.56], [9.02, 46.19], [9.08, 45.81], [9.19, 45.46], [9.69, 45.05], [10.33, 44.8], [11.34, 44.49], [11.25, 43.77], [11.33, 43.32], [12.1, 42.42], [12.45, 41.9]];
  const mapT = label(CWm, CHm, (g, w, h) => {
    g.fillStyle = "#D9CBB0"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(90,74,58,.16)"; g.lineWidth = 2; for (let y = 8; y < h; y += 14) { g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, y + Math.sin(x * 0.02 + y) * 2.5); g.stroke(); }
    ringPath(g); g.fillStyle = CARD; g.fill("evenodd");
    for (const c of GEO) { g.save(); ringPath(g, c.name); g.fillStyle = CARD; g.fill(); g.restore(); }
    g.save(); ringPath(g, "Switzerland"); g.fillStyle = "rgba(200,16,46,.22)"; g.fill(); g.strokeStyle = RED; g.lineWidth = 4; g.stroke(); g.restore();
    g.setLineDash([10, 7]); g.strokeStyle = "rgba(90,74,58,.55)"; g.lineWidth = 2.4; for (const c of GEO) { if (c.name === "Switzerland") continue; ringPath(g, c.name); g.stroke(); } g.setLineDash([]);
    // Swiss cross
    const [sx, sy] = PC(7.6, 46.75); g.fillStyle = RED; g.fillRect(sx - 26, sy - 26, 52, 52); g.fillStyle = "#fff"; g.fillRect(sx - 6, sy - 18, 12, 36); g.fillRect(sx - 18, sy - 6, 36, 12);
    const C1 = '700 46px Cinzel, Georgia, serif', C2 = '600 34px Cinzel, Georgia, serif', I1 = 'italic 400 36px Lora, Georgia, serif';
    mapLabel(g, "KONFEDERASI SWISS", 7.3, 47.55, C1, "#8E1023", 6);
    mapLabel(g, "ROMA", 13.35, 41.95, '700 48px Cinzel, Georgia, serif', SH, 4);
    mapLabel(g, "Luzern", 7.6, 47.2, '600 30px Lora, Georgia, serif', SH, 1);
    for (const [n, lo, la] of [["Milano", 8.55, 45.5], ["Bologna", 11.95, 44.6], ["Firenze", 10.55, 43.75]]) { const [x, y] = PC(lo, la); mapLabel(g, n, lo, la, '600 30px Lora, Georgia, serif', SH, 1); }
    for (const [lo, la] of ROUTE.slice(1, -1)) { const [x, y] = PC(lo, la); g.beginPath(); g.arc(x, y, 6, 0, 7); g.fillStyle = SH; g.fill(); }
    mapLabel(g, "Pegunungan Alpen", 11.9, 47.35, I1, SH, 4);
    mapLabel(g, "Laut Tirenia", 10.6, 41.2, I1, "#6E6050", 6);
    mapLabel(g, "Laut Adriatik", 14.0, 43.4, I1, "#6E6050", 4, -0.62);
    mapLabel(g, "SEMENANJUNG ITALIA", 13.6, 42.75, C2, "rgba(90,74,58,.8)", 8, 0.86);
    // cartouche
    const [kx, ky] = PC(6.9, 41.35);
    g.fillStyle = "rgba(242,234,219,.95)"; g.fillRect(kx - 230, ky - 60, 460, 120); g.strokeStyle = SH; g.lineWidth = 4; g.strokeRect(kx - 230, ky - 60, 460, 120); g.lineWidth = 1.5; g.strokeRect(kx - 220, ky - 50, 440, 100);
    g.fillStyle = SH; g.textAlign = "center"; g.textBaseline = "middle"; g.font = '700 34px Cinzel, Georgia, serif'; g.letterSpacing = "4px"; g.fillText("RUTE PASUKAN SWISS", kx, ky - 14);
    g.font = 'italic 400 26px Lora, Georgia, serif'; g.letterSpacing = "1px"; g.fillText("1505–1506 · jalur ilustratif", kx, ky + 26);
    g.strokeStyle = SH; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 2; g.strokeRect(30, 30, w - 60, h - 60);
  });
  B(MW + 10, 1, MH + 10, mTrav, MX, -0.5, MZ);
  const mapGeo = new THREE.PlaneGeometry(MW, MH, 80, 88);
  mapGeo.rotateX(-Math.PI / 2);
  { const p = mapGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, fold(p.getX(i), p.getZ(i))); mapGeo.computeVertexNormals(); }
  const mapMesh = new THREE.Mesh(mapGeo, new THREE.MeshStandardMaterial({ map: mapT, roughness: 0.92 }));
  mapMesh.position.set(MX, 0.05, MZ); mapMesh.receiveShadow = true; scene.add(mapMesh);
  // route overlay (dashes draw on)
  const rp = ROUTE.map(([lo, la]) => P(lo, la));
  const rpl = [0]; for (let i = 1; i < rp.length; i++) rpl.push(rpl[i - 1] + Math.hypot(rp[i][0] - rp[i - 1][0], rp[i][1] - rp[i - 1][1]));
  const ML = rpl[rpl.length - 1];
  const mapAt = (s) => {
    if (s <= 0) { const dx = rp[1][0] - rp[0][0], dz = rp[1][1] - rp[0][1], l = Math.hypot(dx, dz); return [rp[0][0] + (dx / l) * s, rp[0][1] + (dz / l) * s, dx / l, dz / l]; }
    s = Math.min(ML, s); let i = 1; while (i < rpl.length - 1 && rpl[i] < s) i++;
    const a = rp[i - 1], b = rp[i], u = (s - rpl[i - 1]) / (rpl[i] - rpl[i - 1]), l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, (b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  const rov = dyn(CWm, CHm);
  const rovGeo = mapGeo.clone(); { const p = rovGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + 0.03); }
  const rovMesh = new THREE.Mesh(rovGeo, new THREE.MeshStandardMaterial({ map: rov.tx, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  rovMesh.position.copy(mapMesh.position); rovMesh.renderOrder = 2; scene.add(rovMesh);
  let rovKey = -1;
  const drawRoute = (p) => {
    const k = Math.round(p * 300); if (k === rovKey) return; rovKey = k;
    const g = rov.g; g.clearRect(0, 0, CWm, CHm);
    if (p > 0) {
      g.strokeStyle = RED; g.lineWidth = 9; g.lineCap = "round"; g.setLineDash([18, 16]);
      g.beginPath(); const lim = ML * p;
      for (let i = 0; i < rp.length; i++) { const c = Cm(...rp[i]); if (i === 0) { g.moveTo(...c); continue; } if (rpl[i] <= lim) g.lineTo(...c); else { const u = (lim - rpl[i - 1]) / (rpl[i] - rpl[i - 1]); g.lineTo(...Cm(rp[i - 1][0] + (rp[i][0] - rp[i - 1][0]) * u, rp[i - 1][1] + (rp[i][1] - rp[i - 1][1]) * u)); break; } }
      g.stroke(); g.setLineDash([]);
      const c0 = Cm(...rp[0]); g.beginPath(); g.arc(c0[0], c0[1], 14, 0, 7); g.fillStyle = RED; g.fill();
    }
    rov.tx.needsUpdate = true;
  };
  drawRoute(0);
  // folded-paper mountains, kept clear of the route
  const mtn = [[6.9, 45.9], [7.4, 46.05], [7.9, 46.35], [9.6, 46.45], [10.2, 46.5], [10.8, 46.4], [11.4, 46.65], [12.0, 46.75], [12.7, 46.55], [13.4, 46.4], [7.2, 45.3], [7.0, 44.6], [9.9, 46.95], [10.9, 47.05], [11.8, 47.1], [12.6, 47.15], [13.7, 47.0], [14.4, 46.7], [6.6, 45.0], [7.7, 45.75], [10.0, 44.25], [10.6, 44.05], [12.2, 43.5], [12.9, 43.0], [13.4, 42.4], [13.9, 42.0], [14.6, 41.6], [8.0, 46.75], [9.4, 46.85]];
  const mtnM = pm("#F7F1E4");
  for (const [lo, la] of mtn) {
    const [x, z] = P(lo, la);
    if (rp.some((q, i) => i > 0 && (() => { const a = rp[i - 1], dx = q[0] - a[0], dz = q[1] - a[1], u = clamp01(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)); return Math.hypot(a[0] + dx * u - x, a[1] + dz * u - z) < 2.0; })())) continue;
    const big = la > 45.5, rr = big ? 1.6 + rnd() * 1.2 : 1.1 + rnd() * 0.6, hh = big ? 2.6 + rnd() * 2 : 1.4 + rnd() * 0.8;
    const m = add(new THREE.ConeGeometry(rr, hh, 4), mtnM, MX + x, hh / 2 + fold(x, z), MZ + z); m.rotation.y = rnd() * 1.5;
    if (big) { const cap = add(new THREE.ConeGeometry(rr * 0.36, hh * 0.36, 4), pm("#FFFFFF"), MX + x, hh * 0.82 + fold(x, z) + 0.02, MZ + z); cap.rotation.y = m.rotation.y; }
  }
  // pins: Swiss flag at Lucerne, the Vatican's yellow-white flag at Rome
  const pin = (lo, la, draw) => {
    const [x, z] = P(lo, la), G = new THREE.Group(); G.position.set(MX + x, fold(x, z), MZ + z); scene.add(G);
    add(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), pm("#6B4A2A"), 0, 2, 0, G);
    const tx = canvasTex(256, 192, draw);
    const fl = add(new THREE.PlaneGeometry(2.4, 1.8, 8, 1), new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.9 }), 1.2, 3.1, 0, G);
    add(new THREE.SphereGeometry(0.22, 8, 6), pm(RED), 0, 4.05, 0, G);
    return { G, fl };
  };
  const pinRome = pin(12.45, 41.9, (g, w, h) => { g.fillStyle = YEL; g.fillRect(0, 0, w / 2, h); g.fillStyle = "#FBF7EE"; g.fillRect(w / 2, 0, w / 2, h); g.fillStyle = "#C9A24A"; g.beginPath(); g.arc(w * 0.75, h / 2, 26, 0, 7); g.fill(); });
  const pinSwiss = pin(8.31, 47.05, (g, w, h) => { g.fillStyle = RED; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(w / 2 - 16, h / 2 - 54, 32, 108); g.fillRect(w / 2 - 54, h / 2 - 16, 108, 32); });
  const RX = MX + P(12.45, 41.9)[0], RZ = MZ + P(12.45, 41.9)[1], LX = MX + P(8.31, 47.05)[0], LZ = MZ + P(8.31, 47.05)[1];
  const walkers = crowd(texWalk, 150, 1.05);

  // ======================= STATION D: oath courtyard =======================
  const DX = 220;
  B(70, 1, 54, mTrav, DX, -0.5, 0);
  const cobT = canvasTex(512, 512, (g, w) => { g.fillStyle = "#E6DAC2"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(90,74,58,.28)"; g.lineWidth = 2; for (let y = 0; y < w; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w; x += 32) g.strokeRect(x, y, 32, 32); }, [6, 5]);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(64, 48), new THREE.MeshStandardMaterial({ map: cobT, roughness: 0.95 })); cob.rotation.x = -Math.PI / 2; cob.position.set(DX, 0.03, 0); cob.receiveShadow = true; scene.add(cob);
  const loggiaT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = CARD; g.fillRect(0, 0, w, h); for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const x = 57 + i * 114, y = 150 + row * 150; g.fillStyle = row === 2 ? "#5E4C3B" : "#7A6650"; g.fillRect(x - 34, y - 60, 68, 110); g.beginPath(); g.arc(x, y - 60, 34, Math.PI, 0); g.fill(); } g.strokeStyle = "rgba(90,74,58,.45)"; g.lineWidth = 3; for (const y of [40, 190, 340]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  add(new THREE.BoxGeometry(62, 26, 2), [mCard, mCard, mCard, mCard, new THREE.MeshStandardMaterial({ map: loggiaT, roughness: 0.93 }), mCard], DX, 13, -16);
  const bigStand = single(texStand, 18), bigOath = single(texOath, 18);
  bigStand.position.set(DX, 0, 0); bigOath.position.set(DX, 0, 0);
  const recruits = [-15, -9.5, 9.5, 15].map((dx) => { const s = single(texStand, 12.5), o = single(texOath, 12.5); s.position.set(DX + dx, 0, -8); o.position.set(DX + dx, 0, -8); return { s, o }; });
  // guard banner on a pole, waving
  const flagT = canvasTex(512, 512, (g, w) => {
    const q = [[BLUE, YEL], [RED, YEL], [YEL, BLUE], [RED, BLUE]];
    for (let k = 0; k < 4; k++) { const x0 = (k % 2) * w / 2, y0 = Math.floor(k / 2) * w / 2; for (let i = 0; i < 6; i++) { g.fillStyle = q[k][i % 2]; g.fillRect(x0, y0 + (i * w) / 12, w / 2, w / 12 + 1); } }
    g.fillStyle = "#FBF7EE"; g.fillRect(w / 2 - 28, 0, 56, w); g.fillRect(0, w / 2 - 28, w, 56);
    g.fillStyle = RED; g.fillRect(w / 2 - 70, w / 2 - 70, 140, 140); g.fillStyle = "#fff"; g.fillRect(w / 2 - 14, w / 2 - 48, 28, 96); g.fillRect(w / 2 - 48, w / 2 - 14, 96, 28);
  });
  add(new THREE.CylinderGeometry(0.22, 0.22, 21, 8), pm("#6B4A2A"), DX + 8.5, 10.5, -2);
  const flagGeo = new THREE.PlaneGeometry(8, 8, 24, 6); flagGeo.translate(4, 0, 0);
  const flag = add(flagGeo, new THREE.MeshStandardMaterial({ map: flagT, side: THREE.DoubleSide, roughness: 0.9 }), DX + 8.5, 16.5, -2);
  const flagBase = Float32Array.from(flagGeo.attributes.position.array);
  // height ruler (1 unit = 10 cm) with the 174 cm mark
  const rulerT = label(160, 1600, (g, w, h) => {
    g.fillStyle = "#F7E9B8"; g.fillRect(0, 0, w, h); g.strokeStyle = SH; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    for (let cm = 0; cm <= 200; cm += 2) { const y = h - 16 - ((h - 32) * cm) / 200; g.strokeStyle = SH; g.lineWidth = cm % 10 ? 1.5 : 3; g.beginPath(); g.moveTo(0, y); g.lineTo(cm % 10 ? 26 : cm % 50 ? 44 : 60, y); g.stroke(); if (cm % 20 === 0 && cm) { g.fillStyle = SH; g.font = "700 34px Lora, Georgia, serif"; g.textBaseline = "middle"; g.fillText(String(cm), 70, y); } }
  });
  const ruler = new THREE.Group(); ruler.position.set(DX - 9.5, 0, 3); scene.add(ruler);
  const rulerM = add(new THREE.PlaneGeometry(2, 20.8), new THREE.MeshStandardMaterial({ map: rulerT, roughness: 0.9, side: THREE.DoubleSide }), 0, 10.4, 0, ruler);
  B(2.1, 20.9, 0.25, pm("#C9A24A"), 0, 10.45, -0.15, ruler);
  const markG = new THREE.Group(); ruler.add(markG);
  B(9.4, 0.12, 0.12, pm(RED, { emissive: 0x400008 }), 5.4, 0, 0.2, markG);
  const tabT = label(256, 128, (g, w, h) => { g.fillStyle = RED; poly(g, [[w, h / 2], [w - 40, 0], [0, 0], [0, h], [w - 40, h]]); g.fill(); g.fillStyle = "#fff"; g.font = "700 64px Lora, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("174", 106, h / 2 + 4); });
  add(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshStandardMaterial({ map: tabT, transparent: true, side: THREE.DoubleSide }), -2.6, 0, 0.25, markG);
  // s7: fabric swatches, the misattributed sketch, Repond's pattern sheet
  const swatch = (cols, i) => { const tx = canvasTex(256, 384, (g, w, h) => { stripes(g, 0, 0, w, h, cols, 32); g.strokeStyle = "rgba(255,255,255,.7)"; g.setLineDash([10, 8]); g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28); }); const G = new THREE.Group(); G.position.set(DX - 15, 0, 6 + i * 0.6); scene.add(G); const m = add(new THREE.PlaneGeometry(4, 6), new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.9 }), 0, 3, 0, G); return G; };
  const sw = [swatch([BLUE, "#2A4AA8"], 0), swatch([RED, "#A80D27"], 1), swatch([YEL, "#E0A800"], 2)];
  const sheet = (draw) => { const G = new THREE.Group(); G.position.set(DX + 14, 0, 5); scene.add(G); add(new THREE.PlaneGeometry(9, 12), new THREE.MeshStandardMaterial({ map: canvasTex(384, 512, draw), side: THREE.DoubleSide, roughness: 0.92 }), 0, 6.4, 0, G); B(9.3, 12.3, 0.2, mShade, 0, 6.4, -0.15, G); return G; };
  const sketch = sheet((g, w, h) => {
    g.fillStyle = "#F4EEDF"; g.fillRect(0, 0, w, h);
    const a = document.createElement("canvas"); a.width = 256; a.height = 512; drawFigure(a.getContext("2d"), "stand", { ...GPAL, a: "#bbb", b: "#ddd", c: "#999", plume: "#aaa", metal: "#999", skin: "#ddd", shoe: "#888" });
    g.globalAlpha = 0.55; g.filter = "grayscale(1)"; g.drawImage(a, 64, 10, 256, 480); g.filter = "none"; g.globalAlpha = 1;
    g.strokeStyle = "rgba(60,50,40,.5)"; g.lineWidth = 1.2; const q = mulberry(5); for (let i = 0; i < 160; i++) { const x = 90 + q() * 200, y = 60 + q() * 420; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8 + q() * 10, y - 8 - q() * 10); g.stroke(); }
  });
  const xMark = new THREE.Group(); sketch.add(xMark); xMark.position.set(0, 6.4, 0.25);
  for (const s of [-1, 1]) B(12.5, 0.9, 0.12, pm(RED, { emissive: 0x300006 }), 0, 0, 0, xMark).rotation.z = s * 0.92;
  const pattern = sheet((g, w, h) => {
    g.fillStyle = "#EFE6D0"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(31,58,147,.25)"; g.lineWidth = 1; for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = SH; g.lineWidth = 3; g.setLineDash([12, 8]);
    poly(g, [[60, 60], [190, 50], [210, 220], [70, 230]]); g.stroke();
    poly(g, [[230, 70], [330, 80], [320, 250], [240, 240]]); g.stroke();
    g.beginPath(); g.ellipse(130, 360, 90, 70, 0, 0, 7); g.stroke();
    poly(g, [[250, 300], [330, 300], [320, 470], [262, 470]]); g.stroke(); g.setLineDash([]);
    stripes(g, 80, 90, 100, 14, [BLUE, YEL, RED], 14); stripes(g, 60, 340, 140, 14, [BLUE, YEL, RED], 14);
  });

  // dust in the lamp light
  const dust = pts(scene, 300, { color: 0xffe6b0, size: 0.18, add: true, opacity: 0.5 });
  const dSeed = [...Array(300)].map(() => [rnd() - 0.5, rnd(), rnd() - 0.5, rnd() * 6, 0.2 + rnd() * 0.5]);

  // ---------- timing ----------
  const c1 = A("s2:Kisahnya"), c2 = A("s4:Ujian"), c3 = A("s6:Hingga"), c4 = A("s8:Lima");
  const hk135 = A("s1:135"), rise = A("s1:dunia") - 1.0, flat = A("s2:Garda") - 0.2;
  const mk150 = A("s3:150"), m0 = A("s3:prajurit") - 0.6, m1 = A("s3:tiba") + 0.3;
  const burn = A("s4:Penjarahan") - 0.3, karl = A("s4:Pasukan") - 0.3, k189 = A("s5:189"), gug = A("s5:gugur"), klem = A("s5:Klemens");
  const oath = A("s6:disumpah"), tall = A("s6:tinggi"), t174 = A("s6:174");
  const biru = A("s7:biru"), merah = A("s7:merah"), kuning = A("s7:kuning"), mich = A("s7:Michelangelo"), fakt = A("s7:Faktanya"), jules = A("s7:Jules");
  const marchHead = (t) => (ML + 50 * 0.24 + 4) * ramp(t, m0, m1);

  // camera: [t, cam xyz, target xyz]
  const keys = [
    [0, 5, 4.5, 54, 0, 10, 8],
    [hk135, -1, 5.5, 50, 0, 11, 6],
    [A("s1:Swiss"), 1, 9, 54, 0, 9, 2],
    [A("s2:Vatikan"), 12, 30, 66, 0, 9, -2],
    [c1 - 0.02, 22, 48, 76, 0, 6, 2],
    [c1, RX + 1.5, 8, RZ + 12, RX + 0.6, 1.2, RZ],
    [K.s2e, RX + 3, 20, RZ + 25, RX + 0.5, 0, RZ - 2],
    [(K.s2e + A("s3:Swiss")) / 2, MX + 3, 50, 30, MX + 1, 0, -2],
    [A("s3:Swiss"), LX + 2.5, 20, LZ + 24, LX + 1, 0, LZ + 1.5],
    [mk150, LX + 2, 14, LZ + 18, LX + 1.2, 0, LZ + 1.5],
    [m0 + 1.3, MX + 4, 58, 44, MX + 2, 0, -1],
    [A("s3:1506"), RX + 2, 14, RZ + 18, RX + 0.2, 0.5, RZ - 0.5],
    [A("s3:lahir"), RX + 4, 18, RZ + 23, RX, 0, RZ - 1],
    [c2 - 0.02, RX + 5, 21, RZ + 27, RX, 0, RZ - 1],
    [c2, 30, 26, 72, 32, 4, 10],
    [A("s4:Penjarahan") + 0.4, 50, 30, 82, 44, 3, 20],
    [karl + 0.3, 46, 24, 56, 36, 2, 14],
    [K.s4e, -18, 26, 28, 10, 1, 12],
    [k189 + 0.4, -24, 16, 9, 12, 1, 11],
    [A("s5:147"), -17, 13, 13, 4, 1, 9],
    [gug + 0.6, -16, 10, 19, 2, 1, 9.5],
    [gug + 1.7, -16, 11, 22, 2, 1, 9.5],
    [sis, -12, 12, 28, 2, 1.5, 8],
    [A("s5:42"), 4, 13, 33, 6, 2, 3],
  ];
  for (let k = 0; k <= 4; k++) { const t = wk0 + 0.9 + k * ((c3 - 0.05 - wk0 - 0.9) / 4), p = routeAt(Q0 + walkH(t) - 4); keys.push([t, p[0] + 3, p[1] + 12, p[2] + 30, p[0], p[1] + 1, p[2]]); }
  keys.push(
    [c3, DX + 6, 11, 44, DX, 9, 0],
    [oath + 0.5, DX - 1, 11, 37, DX, 10, 0],
    [A("s6:Syaratnya"), DX - 5, 10, 42, DX - 3, 8.5, 0],
    [tall - 0.2, DX - 8, 13, 36, DX - 7, 11, 1],
    [t174 + 0.6, DX - 10, 17, 30, DX - 8.5, 16, 1],
    [K.s6e, DX + 2, 12, 46, DX, 9, 0],
    [biru, DX - 9, 9, 33, DX - 9, 7.5, 2],
    [kuning + 0.5, DX - 11, 8, 30, DX - 12, 5, 3],
    [mich + 0.6, DX + 6, 12, 56, DX + 7, 7.5, 2],
    [fakt + 0.6, DX + 8, 11.5, 52, DX + 8, 7.5, 2],
    [jules + 0.8, DX + 9, 11, 48, DX + 9, 7.5, 2],
    [K.s7e, DX + 3, 13, 44, DX + 2, 9, 0],
    [c4 - 0.02, DX + 2, 14, 46, DX + 2, 9, 0],
    [c4, 10, 30, 78, 0, 9, 0],
    [K.end, 2, 50, 108, 0, 9, -4],
    [K.dur, 0, 54, 114, 0, 9, -4],
  );
  // a cut is two keys a hair apart: no interpolation across it
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const cBg = new THREE.Color(0x2a1d14), cBgFire = new THREE.Color(0x1c0d08), hemiDay = new THREE.Color(0xfff0d8), hemiFire = new THREE.Color(0xff9a6a);

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check("700 40px Cinzel") && document.fonts.check("400 30px Lora")) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; } }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.5, c[1] + Math.sin(t * 0.29) * 0.35, c[2] + Math.cos(t * 0.31) * 0.4);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.position.set(tgt.x - 36, 70, tgt.z + 40); key.target.position.copy(tgt);
    const yawTo = (x, z) => Math.atan2(cam.position.x - x, cam.position.z - z);

    // 1527 mood: lamp dims, fire light rises
    const fire = t >= c2 && t < c3 ? ramp(t, burn - 0.5, burn + 1.2) : 0;
    hemi.color.copy(hemiDay).lerp(hemiFire, fire * 0.3); hemi.intensity = 1.05 - 0.4 * fire;
    key.intensity = 1.7 - 0.8 * fire; scene.background.copy(cBg).lerp(cBgFire, fire); scene.fog.color.copy(scene.background);
    fireL1.intensity = fire * (150 + Math.sin(t * 17) * 25); fireL2.intensity = fire * (150 + Math.sin(t * 13 + 1) * 25);
    r.toneMappingExposure = 1.0 - 0.12 * fire;

    // army flats rise behind the basilica, then fold flat
    armies.forEach((m, i) => { const up = eout(ramp(t, rise + i * 0.22, rise + 0.9 + i * 0.22)) * (1 - ramp(t, flat + i * 0.12, flat + 0.8 + i * 0.12)); m.rotation.x = -Math.PI / 2 * (1 - up); m.visible = up > 0.01; });

    // Vatican guards
    const v1 = t < c2 || t >= c4;
    const walkU = clamp01((t - sis) / 1.5);
    for (let i = 0; i < 189; i++) {
      let x, z, y = 0, tilt = 0, s = 1, roll = 0;
      if (v1) {
        if (i >= 135) { setI(guards, i, 0, -9, 0, 0, 0, 0); continue; }
        [x, z] = hookPos[i];
        const pop = t >= c4 ? 1 : back(clamp01((t + 0.4 - (i % 9) * 0.02 - Math.floor(i / 9) * 0.03) / 0.35));
        s = Math.max(0.001, pop); roll = Math.sin(t * 1.3 + i) * 0.02;
      } else {
        [x, z] = defPos[i];
        const sk = surv.get(i);
        if (sk !== undefined && t > sis) {
          const row = Math.floor(sk / 2), side = sk % 2 ? 0.42 : -0.42;
          const sq = Q0 - row * 0.8, qp = routeAt(sq), qx = qp[0] + qp[3] * side, qz = qp[2] + qp[4] * side;
          if (t < wk0) { const u = eout(clamp01((walkU - row * 0.01))); x = x + (qx - x) * u; z = z + (qz - z) * u; y = Math.abs(Math.sin(t * 12 + i)) * 0.12 * (u < 1 ? 1 : 0); }
          else { const p = routeAt(sq + walkH(t)); x = p[0] + p[3] * side; z = p[2] + p[4] * side; y = p[1] + Math.abs(Math.sin(t * 13 + i)) * 0.14; }
        } else if (sk === undefined) {
          const ft = gug + 0.05 + fallT.get(i) * 1.4, u = eout(clamp01((t - ft) / 0.45));
          tilt = -1.52 * u; y = 0.06 * u;
        }
      }
      setI(guards, i, x, y, z, yawTo(x, z), tilt, s, roll);
    }
    guards.instanceMatrix.needsUpdate = true;
    // pope walks in the middle of the escort
    const pv = t >= klem - 0.2 && t < c3;
    pope.visible = pv;
    if (pv) { const p = routeAt(Q0 - 10.5 * 0.8 + walkH(t)); pope.position.set(p[0], p[1] + Math.abs(Math.sin(t * 12)) * 0.1, p[2]); pope.rotation.set(0, yawTo(p[0], p[2]), 0); pope.scale.setScalar(Math.max(0.001, back(clamp01((t - klem + 0.2) / 0.35)))); }
    // invaders march down the street
    for (let i = 0; i < 90; i++) {
      const on = t >= c2 && t < c3, a = karl + (i % 9) * 0.02 + Math.floor(i / 9) * 0.06;
      if (!on || t < a) { setI(inv, i, 0, -9, 0, 0, 0, 0); continue; }
      const u = eout(clamp01((t - a) / 3.2)), push = 4 * ramp(t, sis, c3);
      const x = invStart[i][0] + (invEnd[i][0] - invStart[i][0]) * u + (u > 0 ? -push * 0.4 : 0), z = invStart[i][1];
      setI(inv, i, x, u < 1 ? Math.abs(Math.sin(t * 11 + i)) * 0.12 : 0, z, yawTo(x, z), 0, back(clamp01((t - a) / 0.3)));
    }
    inv.instanceMatrix.needsUpdate = true;
    // flames, embers
    for (let i = 0; i < NF; i++) {
      const [x, y, z, sc, ph, d] = flSpots[i], on = t >= c2 && t < c3 ? eout(clamp01((t - burn - d * 2.2) / 0.5)) : 0;
      setI(flames, i, x, y, z, yawTo(x, z), 0, on * sc * (1 + Math.sin(t * 9 + ph) * 0.1), Math.sin(t * 6 + ph) * 0.08);
    }
    flames.instanceMatrix.needsUpdate = true;
    const ep = embers.pos;
    for (let i = 0; i < 220; i++) { const q = emSeed[i], h = houses[i % houses.length], life = (t * (0.4 + q[0] * 0.5) + q[1]) % 1; ep[i * 3] = h[0] + (q[2] - 0.5) * 3 + Math.sin(t * 2 + i) * 0.5; ep[i * 3 + 1] = fire > 0.01 ? h[2] + life * 9 : -50; ep[i * 3 + 2] = h[1] + (q[3] - 0.5) * 3; }
    embers.commit(); embers.m.opacity = 0.85 * fire;
    // candles light one by one after the fall
    const cOn = t >= c2 && t < c3;
    for (let i = 0; i < NC; i++) { const ct = gug + 0.9 + i * 0.05, u = cOn ? back(clamp01((t - ct) / 0.3)) : 0; const [x, z] = candPos[i]; setI(candles, i, x, 0, z, 0, 0, u); candFl.pos[i * 3] = x; candFl.pos[i * 3 + 1] = u > 0.9 ? 0.72 + Math.sin(t * 15 + i) * 0.03 : -50; candFl.pos[i * 3 + 2] = z; }
    candles.instanceMatrix.needsUpdate = true; candFl.commit();
    candL.intensity = cOn ? 16 * ramp(t, gug + 0.9, gug + 2.2) * (1 + Math.sin(t * 13) * 0.06) : 0;

    // map: march column, route, pins
    const mOn = t >= c1 - 0.1 && t < c2;
    const hd = marchHead(t);
    drawRoute(mOn ? clamp01(hd / ML) : 0);
    for (let i = 0; i < 150; i++) {
      const row = Math.floor(i / 3), lane = (i % 3) - 1;
      if (!mOn || t < mk150 - 0.1) { setI(walkers, i, 0, -9, 0, 0, 0, 0); continue; }
      let sp = hd - row * 0.24;
      if (sp > ML - 3) sp = ML - 3 + 3 * (1 - Math.exp(-(sp - ML + 3) / 3));
      const [x, z, dx, dz] = mapAt(sp), lx = x - dz * lane * 0.36, lz = z + dx * lane * 0.36;
      const moving = t > m0 && t < m1 + 0.4;
      setI(walkers, i, MX + lx, fold(lx, lz) + (moving ? Math.abs(Math.sin(t * 13 + i * 1.7)) * 0.1 : 0), MZ + lz, yawTo(MX + lx, MZ + lz), 0, back(clamp01((t - mk150 - row * 0.012) / 0.3)), moving ? Math.sin(t * 13 + i) * 0.06 : 0);
    }
    walkers.instanceMatrix.needsUpdate = true;
    pinRome.G.scale.setScalar(Math.max(0.001, back(clamp01((t - c1 - 0.2) / 0.4))));
    pinSwiss.G.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s3:Swiss") + 0.3) / 0.4))));
    for (const p of [pinRome, pinSwiss]) { const pa = p.fl.geometry.attributes.position; if (!p.base) p.base = Float32Array.from(pa.array); for (let i = 0; i < pa.count; i++) { const x = p.base[i * 3]; pa.setZ(i, Math.sin(x * 2.4 - t * 6) * 0.12 * (x + 1.2)); } pa.needsUpdate = true; }

    // oath courtyard
    const oathOn = t >= oath && t < K.s7;
    bigOath.visible = oathOn; bigStand.visible = !oathOn;
    for (const s of [bigOath, bigStand]) s.rotation.set(0, yawTo(DX, 0) * 0.6, 0);
    recruits.forEach((rc, i) => { const on = t >= oath + 0.25 + i * 0.12 && t < K.s7; rc.o.visible = on; rc.s.visible = !on; rc.o.rotation.y = rc.s.rotation.y = yawTo(rc.s.position.x, rc.s.position.z) * 0.6; });
    { const pa = flagGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = flagBase[i * 3], y = flagBase[i * 3 + 1]; pa.setZ(i, Math.sin(x * 0.9 - t * 4.2 + y * 0.2) * 0.35 * (x / 8)); } pa.needsUpdate = true; flagGeo.computeVertexNormals(); }
    const ru = eout(ramp(t, tall - 0.6, tall + 0.3)) * (1 - ramp(t, K.s7 - 0.2, K.s7 + 0.6));
    ruler.scale.set(1, Math.max(0.001, ru), 1); ruler.visible = ru > 0.002; ruler.rotation.y = 0.25;
    markG.position.y = 17.4 * eout(ramp(t, t174 - 0.3, t174 + 0.9)); markG.visible = t > t174 - 0.3;
    sw.forEach((G, i) => { const a = [biru, merah, kuning][i] - 0.15, u = back(clamp01((t - a) / 0.4)) * (1 - ramp(t, K.s7e - 0.4, K.s7e + 0.4)); G.visible = u > 0.001 && t < c4; G.scale.setScalar(Math.max(0.001, u)); G.rotation.set(0, 0.5 - i * 0.28, -0.12 + i * 0.12); G.position.x = DX - 15 + i * 1.6; });
    const skIn = eout(ramp(t, mich - 0.9, mich - 0.2)), skOut = eout(ramp(t, jules - 0.5, jules + 0.2));
    sketch.visible = skIn > 0.001 && skOut < 0.999 && t < c4; sketch.rotation.set(-1.45 * (1 - skIn) - 0.15, -0.25, 0); sketch.position.set(DX + 14 - skOut * 2, 0, 5 - skOut * 9); sketch.rotation.x -= skOut * 1.3;
    xMark.scale.setScalar(Math.max(0.001, back(clamp01((t - fakt) / 0.25))));
    const paIn = eout(ramp(t, jules - 0.2, jules + 0.6));
    pattern.visible = paIn > 0.001 && t < c4; pattern.rotation.set(-1.45 * (1 - paIn) - 0.15, -0.25, 0); pattern.position.set(DX + 13, 0, 5.4);

    // dust near the lens target
    const d = dust.pos;
    for (let i = 0; i < 300; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 40 + Math.sin(t * q[4] + q[3]) * 1.2; d[i * 3 + 1] = 0.5 + ((q[1] * 22 + t * q[4] * 0.5) % 22); d[i * 3 + 2] = tgt.z + q[2] * 40 + 10 + Math.cos(t * q[4] + q[3]) * 1.2; }
    dust.commit();
    // keep the hook's army flats crisp; full tilt-shift once they fold away
    const ta = 0.25 + 0.75 * ramp(t, flat + 0.4, flat + 1.4);
    tiltH.uniforms.amt.value = tiltV.uniforms.amt.value = ta;
    bp.strength = 0.16 + 0.1 * fire;
    comp.render();
  };
}
