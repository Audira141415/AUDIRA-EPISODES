// EP25 BANGKOK, NAMA TERPANJANG: MANUSCRIPT. A candle-lit walnut desk (units ~ cm, desk top y = 0):
// A (0, -62..54)  a royal parchment scroll that unrolls toward the viewer; the ceremonial name is written word by word in
//                 gold ink (Latin transliteration, 21 words) by a quill; a BANGKOK tag hangs from the lower roller and is
//                 struck through; the colophon carries the AUDIRA wax seal (s8).
// B (-42, 47)     ink sketch: stilt village on a river bank ("bang") with an ink pot and a resting quill
// C (-44, -8)     parchment map of Thailand (Natural Earth) with the Chao Phraya drawn in, an inset of the river bend,
//                 a crown token on the east bank and a 1782 wax seal
// D (44, -44)     illuminated panel on a lectern: six gold roundels of meanings + a ring of nine 3D gems
// E (44, 2)       brass record plaque: NAMA TEMPAT TERPANJANG DI DUNIA / 168 HURUF (Guinness World Records)
// F (44, 44)      abstract 1989 motif: a spinning record and a gold sound-wave row (no lyrics, no Thai script), then
//                 tile racks KRUNG THEP / KOTA MALAIKAT and KO THO MO
// Everything is a function of t.

const FONTS = ['700 80px "Cinzel"', '600 80px "Cinzel"', '500 80px "EB Garamond"', 'italic 500 80px "EB Garamond"', '700 80px "EB Garamond"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "Krung Thep 1782"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const CIN = '"Cinzel", Georgia, serif', GAR = '"EB Garamond", Georgia, serif';
const PARCH = "#F1E3C2", INK = "#3B2412", GOLD = "#C9A227", LAC = "#8E1B1B", BLUEINK = "#2B4C7E";
const ENV = 0.35;
export const NAME = "Krung Thep Maha Nakhon Amon Rattanakosin Mahintharayutthaya Mahadilok Phop Noppharat Ratchathani Burirom Udomratchaniwet Mahasathan Amon Phiman Awatan Sathit Sakkathattiya Witsanukam Prasit".split(" ");

// Hermite track with harmonic-mean tangents: never overshoots a key.
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

// parchment: warm base, mottling, fibres, speckles, foxing and darker edges
function parchment(g, w, h, seed = 3, base = PARCH, edge = 0.28) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed), A = w * h;
  for (let i = 0; i < A / 9000; i++) {
    const x = q() * w, y = q() * h, rr = 30 + q() * 180, dark = q() < 0.6;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, dark ? `rgba(150,105,50,${0.04 + q() * 0.07})` : `rgba(255,248,225,${0.05 + q() * 0.08})`); gr.addColorStop(1, "rgba(150,105,50,0)");
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  g.lineCap = "round";
  for (let i = 0; i < A / 160; i++) {
    const x = q() * w, y = q() * h, l = 4 + q() * 26, a = q() * 6.283, c = q() < 0.7;
    g.strokeStyle = c ? `rgba(110,75,35,${0.05 + q() * 0.09})` : `rgba(255,250,232,${0.12 + q() * 0.12})`; g.lineWidth = 0.6 + q() * 1.1;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < A / 380; i++) { g.fillStyle = `rgba(90,60,25,${0.08 + q() * 0.18})`; const s = 0.6 + q() * 1.6; g.fillRect(q() * w, q() * h, s, s); }
  for (let i = 0; i < A / 90000; i++) { const x = q() * w, y = q() * h, rr = 3 + q() * 9; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(130,80,30,.32)"); gr.addColorStop(1, "rgba(130,80,30,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  const e = Math.min(w, h) * 0.12;
  for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, e, 0, 0, 0, e, h], [w, 0, w - e, 0, w - e, 0, e, h], [0, 0, 0, e, 0, 0, w, e], [0, h, 0, h - e, 0, h - e, w, e]]) {
    const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(105,65,25,${edge})`); gr.addColorStop(1, "rgba(105,65,25,0)"); g.fillStyle = gr; g.fillRect(rx, ry, rw, rh);
  }
}
// gold ink text with a dark ink edge so it reads on cream
function goldText(g, txt, x, y, font, align = "left", lw = 7) {
  g.font = font; g.textAlign = align; g.textBaseline = "alphabetic";
  g.lineJoin = "round"; g.strokeStyle = "rgba(59,36,18,.92)"; g.lineWidth = lw; g.strokeText(txt, x, y);
  const m = parseFloat(font.match(/(\d+)px/)[1]);
  const gr = g.createLinearGradient(0, y - m * 0.8, 0, y + m * 0.1);
  gr.addColorStop(0, "#F6D777"); gr.addColorStop(0.5, "#C2912C"); gr.addColorStop(1, "#7A5214");
  g.fillStyle = gr; g.fillText(txt, x, y);
}
function inkText(g, txt, x, y, font, col = INK, align = "center") { g.font = font; g.textAlign = align; g.textBaseline = "alphabetic"; g.fillStyle = col; g.fillText(txt, x, y); }
function knot(g, cx, cy, R, col = GOLD) {
  g.save(); g.translate(cx, cy); g.strokeStyle = INK; g.lineWidth = 3;
  for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); g.beginPath(); g.ellipse(R * 0.45, 0, R * 0.5, R * 0.2, 0, 0, 6.283); g.fillStyle = col; g.fill(); g.stroke(); }
  g.beginPath(); g.arc(0, 0, R * 0.25, 0, 6.283); g.fillStyle = LAC; g.fill(); g.stroke(); g.restore();
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x140c07, exp: 0.9, bloom: [0.14, 0.55, 0.9], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.9;
  r.localClippingEnabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  bp.threshold = 1.25; bp.strength = 0.07; bp.radius = 0.4;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#2E1C10"); gr.addColorStop(0.6, "#1A0F08"); gr.addColorStop(1, "#0E0805"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.FogExp2(0x1c120a, 0.0024);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------- light: warm candle key, low ambient ----------
  const hemi = new THREE.HemisphereLight(0xffe2b8, 0x2a170c, 0.26);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffc98a, 1.05);
  key.position.set(-70, 120, 60); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -115, right: 115, top: 115, bottom: -115, near: 1, far: 400 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x8ea0c0, 0.18); fill.position.set(90, 60, -80); scene.add(fill);
  const gleam = new THREE.PointLight(0xfff0d0, 0, 26, 1.4); scene.add(gleam);

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const add = (m, p = scene, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, envMapIntensity: ENV, ...o });
  const goldM = std({ color: 0xd9ad45, metalness: 0.85, roughness: 0.3, envMapIntensity: ENV * 2.4, emissive: 0x3a2508, emissiveIntensity: 0.6 });
  const woodT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#3B2416"; g.fillRect(0, 0, w, h);
    const q = mulberry(17);
    for (let i = 0; i < 520; i++) {
      const y = q() * h, a = 0.05 + q() * 0.16, c = q() < 0.55 ? `rgba(20,10,5,${a})` : `rgba(120,72,38,${a})`;
      g.strokeStyle = c; g.lineWidth = 0.6 + q() * 2.6; g.beginPath();
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 9 + Math.sin(x * 0.021 + i * 0.3) * 2.5);
      g.stroke();
    }
    for (let i = 0; i < 9; i++) { const x = q() * w, y = q() * h; const gr = g.createRadialGradient(x, y, 0, x, y, 40 + q() * 60); gr.addColorStop(0, "rgba(15,8,3,.35)"); gr.addColorStop(1, "rgba(15,8,3,0)"); g.fillStyle = gr; g.fillRect(x - 100, y - 100, 200, 200); }
  }, [5, 5]);
  const woodM = std({ map: woodT, roughness: 0.48, bumpMap: woodT, bumpScale: 0.6 });
  const darkWood = std({ map: woodT, color: 0x8a6a55, roughness: 0.5 });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.75)"); gr.addColorStop(0.55, "rgba(0,0,0,.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, z, o = 0.6, p = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); m.renderOrder = 1; p.add(m); return m; };
  const glowT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,230,170,1)"); gr.addColorStop(0.3, "rgba(255,190,90,.45)"); gr.addColorStop(1, "rgba(255,160,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  // flat paper sheet lying on the desk; the top plane carries the canvas
  const sheet = (w, d, tex, x, z, ry = 0, rough = 0.85) => {
    const S = G(x, 0, z); S.rotation.y = ry;
    add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), std({ color: 0xd8c39a, roughness: 0.9 })), S).position.y = 0.06;
    const top = add(new THREE.Mesh(new THREE.PlaneGeometry(w, d), std({ map: tex, color: 0xe6d6b6, roughness: rough, bumpMap: tex, bumpScale: 0.35 })), S, false);
    top.rotation.x = -Math.PI / 2; top.position.y = 0.125;
    blob(w * 1.12, d * 1.1, x + 0.6, z + 0.8, 0.5);
    return S;
  };

  // ---------- desk ----------
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), woodM);
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  // ---------- A: the scroll ----------
  const W = 28, ZH = -62, ZE = 54, LEN = ZE - ZH;
  const lineZ = (i) => ZH + 10.5 + i * 4.25;
  const paperY = (x, z) => 0.2 + 0.1 * Math.sin(z * 0.19 + 0.7) + 0.6 * Math.pow(Math.abs(x) / (W / 2), 10);
  const scrollT = label(1024, 4096, (g, w, h) => {
    parchment(g, w, h, 11, PARCH, 0.22);
    const px = h / LEN, zpx = (z) => (z - ZH) * px;
    g.strokeStyle = LAC; g.lineWidth = 5; for (const x of [46, w - 46]) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, h - 30); g.stroke(); }
    g.lineWidth = 2; for (const x of [60, w - 60]) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, h - 30); g.stroke(); }
    g.fillStyle = GOLD; for (let y = 50; y < h - 40; y += 34) for (const x of [53, w - 53]) { g.beginPath(); g.arc(x, y, 3.2, 0, 6.283); g.fill(); }
    g.strokeStyle = "rgba(120,80,40,.16)"; g.lineWidth = 1.5;
    for (let i = 0; i < NAME.length; i++) { const y = zpx(lineZ(i)) + 26; g.beginPath(); g.moveTo(110, y); g.lineTo(w - 110, y); g.stroke(); }
    knot(g, w / 2, zpx(ZH + 4.4), 56);
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(170, zpx(ZH + 4.4)); g.lineTo(w / 2 - 80, zpx(ZH + 4.4)); g.moveTo(w / 2 + 80, zpx(ZH + 4.4)); g.lineTo(w - 170, zpx(ZH + 4.4)); g.stroke();
    // colophon
    const cy = zpx(ZE - 9.5);
    g.strokeStyle = LAC; g.lineWidth = 3; g.beginPath(); g.moveTo(200, cy - 120); g.lineTo(w - 200, cy - 120); g.stroke();
    inkText(g, "~ disalin oleh AUDIRA ~", w / 2, cy - 64, `italic 500 54px ${GAR}`, INK);
    inkText(g, "alih aksara Latin · ilustrasi", w / 2, cy + 236, `italic 500 34px ${GAR}`, "rgba(59,36,18,.75)");
  });
  scrollT.anisotropy = 16;
  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), ZH + 10);
  const paperGeo = new THREE.PlaneGeometry(W, LEN, 24, 240);
  paperGeo.rotateX(-Math.PI / 2);
  { const p = paperGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + ZH + LEN / 2; p.setY(i, paperY(x, z)); } paperGeo.computeVertexNormals(); }
  const paper = add(new THREE.Mesh(paperGeo, std({ map: scrollT, color: 0xe2d2b2, roughness: 0.82, bumpMap: scrollT, bumpScale: 0.4, clippingPlanes: [clip], side: THREE.DoubleSide })), scene, true);
  paper.position.z = ZH + LEN / 2;
  const paperBlob = blob(W * 1.15, LEN, 0.8, ZH + LEN / 2, 0.45); paperBlob.material.clippingPlanes = [clip];
  const rollM = std({ map: scrollT, color: 0xd9c6a0, roughness: 0.85 });
  const rod = (z, rad, p) => {
    const R = G(0, rad, z, p);
    const body = add(new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, W - 0.4, 40), rollM), R); body.rotation.z = Math.PI / 2;
    const core = add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, W + 5, 20), darkWood), R); core.rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) {
      add(new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 16), goldM), R).position.set(s * (W / 2 + 3.0), 0, 0);
      const ring = add(new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.25, 10, 24), goldM), R); ring.rotation.y = Math.PI / 2; ring.position.x = s * (W / 2 + 1.6);
    }
    return { R, body };
  };
  const head = rod(ZH, 1.5);
  blob(W + 10, 6, 0, ZH + 0.5, 0.65);
  const tail = rod(ZH + 10, 3.2);
  const tailBlob = blob(W + 10, 8, 0, ZH + 10, 0.7);

  // gold words
  const words = NAME.map((wd, i) => {
    const st = { tw: 1200 };
    const paint = (g, w, h) => {
      g.clearRect(0, 0, w, h);
      let fs = 118; g.font = `700 ${fs}px ${CIN}`; let tw = g.measureText(wd).width;
      if (tw > w - 40) { fs = Math.floor(fs * (w - 40) / tw); g.font = `700 ${fs}px ${CIN}`; tw = g.measureText(wd).width; }
      goldText(g, wd, 16, h * 0.72, `700 ${fs}px ${CIN}`, "left", 11);
      st.tw = tw + 32;
    };
    const tex = label(2048, 192, paint);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    const ppu = 192 / 3.1;
    const geo = new THREE.PlaneGeometry(1, 3.1); geo.translate(0.5, 0, 0); geo.rotateX(-Math.PI / 2);
    const m = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.25, metalness: 0.55, roughness: 0.32, envMapIntensity: ENV * 2.4, emissive: 0xffc860, emissiveMap: tex, emissiveIntensity: 0.05, depthWrite: false });
    const mesh = new THREE.Mesh(geo, m); mesh.renderOrder = 2;
    const z = lineZ(i);
    mesh.position.set(0, paperY(W / 2 - 2.5, z) + 0.06, z + 0.4);
    scene.add(mesh);
    return { mesh, tex, st, ppu, z, len: wd.length };
  });
  const wordW = (o) => Math.min(W - 4, o.st.tw / o.ppu);

  // BANGKOK tag on a cord from the lower roller's left knob
  const tagT = label(640, 280, (g, w, h) => {
    parchment(g, w, h, 41, "#EAD8AE", 0.3);
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
    g.beginPath(); g.arc(60, h / 2, 16, 0, 6.283); g.stroke();
    inkText(g, "Bangkok", w / 2 + 30, h * 0.6, `italic 700 128px ${GAR}`, INK);
  });
  const tag = G(0, 0, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(16, 0.14, 7), std({ color: 0xd8c39a })), tag).position.y = 0.07;
  { const tp = add(new THREE.Mesh(new THREE.PlaneGeometry(16, 7), std({ map: tagT, roughness: 0.85, bumpMap: tagT, bumpScale: 0.3 })), tag, false); tp.rotation.x = -Math.PI / 2; tp.position.y = 0.145; }
  const strikeM = new THREE.MeshBasicMaterial({ color: 0xa31d1d, transparent: true, opacity: 0.92 });
  const strike = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.55).translate(0.5, 0, 0).rotateX(-Math.PI / 2), strikeM);
  strike.position.set(-4.6, 0.16, 0.25); strike.rotation.y = 0.07; tag.add(strike);
  const noteT = label(900, 200, (g, w, h) => { g.clearRect(0, 0, w, h); inkText(g, "nama panggilan", 10, h * 0.66, `italic 600 104px ${GAR}`, "#A31D1D", "left"); });
  const note = new THREE.Mesh(new THREE.PlaneGeometry(1, 4).translate(0.5, 0, 0).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: noteT, transparent: true, depthWrite: false }));
  note.position.set(-8, 0.17, 6.2); note.rotation.y = 0.04; tag.add(note);
  const tagBlob = blob(19, 10, 0, 0, 0.5);
  const cordM = std({ color: 0x8e1b1b, roughness: 0.7 });
  let cord = null;

  // ---------- B: village sketch ("bang") ----------
  const XB = -42, ZB = 47;
  const villT = label(880, 1100, (g, w, h) => {
    parchment(g, w, h, 23, "#EFDDB6", 0.3);
    g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 1.5; g.strokeRect(38, 38, w - 76, h - 76);
    inkText(g, "bang", w / 2, 150, `italic 700 120px ${GAR}`, LAC);
    inkText(g, "desa di tepi sungai?", w / 2, 222, `italic 500 54px ${GAR}`, INK);
    // river band
    g.fillStyle = "rgba(43,76,126,.28)"; g.beginPath(); g.moveTo(40, 760); for (let x = 40; x <= w - 40; x += 20) g.lineTo(x, 760 + Math.sin(x * 0.012) * 16); g.lineTo(w - 40, 1060); g.lineTo(40, 1060); g.fill();
    g.strokeStyle = "rgba(43,76,126,.8)"; g.lineWidth = 2.4;
    for (let k = 0; k < 9; k++) { g.beginPath(); for (let x = 60 + (k % 3) * 40; x < w - 60; x += 6) g.lineTo(x, 800 + k * 28 + Math.sin(x * 0.05 + k) * 4); g.stroke(); }
    // stilt houses
    const house = (x, y, s) => {
      g.strokeStyle = INK; g.lineWidth = 3.2; g.fillStyle = "rgba(201,162,39,.35)";
      for (const dx of [-0.42, -0.14, 0.14, 0.42]) { g.beginPath(); g.moveTo(x + dx * s, y); g.lineTo(x + dx * s, y + s * 0.75); g.stroke(); }
      g.fillRect(x - s * 0.5, y - s * 0.55, s, s * 0.55); g.strokeRect(x - s * 0.5, y - s * 0.55, s, s * 0.55);
      g.beginPath(); g.moveTo(x - s * 0.72, y - s * 0.5); g.lineTo(x, y - s * 1.2); g.lineTo(x + s * 0.72, y - s * 0.5); g.closePath(); g.fillStyle = "rgba(142,27,27,.55)"; g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x, y - s * 1.2); g.lineTo(x, y - s * 1.38); g.stroke();
    };
    house(190, 700, 130); house(420, 660, 150); house(660, 705, 120);
    // palms
    for (const [x, y] of [[100, 640], [560, 600], [790, 640]]) {
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y + 60); g.quadraticCurveTo(x + 10, y - 60, x + 4, y - 160); g.stroke();
      for (let k = 0; k < 6; k++) { const a = -2.6 + k * 0.48; g.beginPath(); g.moveTo(x + 4, y - 160); g.quadraticCurveTo(x + Math.cos(a) * 60, y - 200 + Math.sin(a) * 30, x + Math.cos(a) * 110, y - 150 + Math.sin(a) * 60); g.stroke(); }
    }
    // boat
    g.fillStyle = "rgba(59,36,18,.85)"; g.beginPath(); g.moveTo(300, 900); g.quadraticCurveTo(420, 950, 560, 895); g.lineTo(540, 915); g.quadraticCurveTo(420, 960, 318, 918); g.fill();
    inkText(g, "asal pasti tidak jelas", w / 2, 1035, `italic 500 44px ${GAR}`, "rgba(59,36,18,.85)");
  });
  sheet(22, 27.5, villT, XB, ZB, 0.06);
  // ink pot + resting quill
  const glassM = std({ color: 0x14100c, roughness: 0.12, metalness: 0.2, envMapIntensity: ENV * 3 });
  const pot = G(XB + 15, 0, ZB - 9);
  add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 3.6, 32), glassM), pot).position.y = 1.8;
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1.0, 24), glassM), pot).position.y = 4.0;
  { const tr = add(new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.22, 8, 24), goldM), pot); tr.rotation.x = Math.PI / 2; tr.position.y = 4.5; }
  blob(8, 8, XB + 15.5, ZB - 8.5, 0.7);

  // quill builder: tip at the group origin, feather up and back
  const vaneShape = new THREE.Shape(); vaneShape.moveTo(0, 0); vaneShape.bezierCurveTo(1.6, 3, 2.2, 10, 0.6, 17); vaneShape.bezierCurveTo(0.2, 12, -0.8, 6, 0, 0);
  const vaneGeo = new THREE.ShapeGeometry(vaneShape, 24);
  const vaneT = canvasTex(64, 256, (g, w, h) => { g.fillStyle = "#F4EBDA"; g.fillRect(0, 0, w, h); const q = mulberry(7); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(120,95,70,${0.1 + q() * 0.25})`; g.lineWidth = 1; g.beginPath(); const y = q() * h; g.moveTo(0, y); g.lineTo(w, y - 18); g.stroke(); } });
  const vaneM = std({ map: vaneT, roughness: 0.75, side: THREE.DoubleSide });
  const quill = () => {
    const Q = new THREE.Group();
    const inner = new THREE.Group(); Q.add(inner);
    inner.rotation.set(0.0, 0, -0.62);
    const shaft = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.07, 22, 10), std({ color: 0xe9dcc0, roughness: 0.4 })), inner); shaft.position.y = 11;
    const nib = add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 1.2, 10), goldM), inner); nib.rotation.x = Math.PI; nib.position.y = 0.6;
    for (const s of [-1, 1]) { const v = add(new THREE.Mesh(vaneGeo, vaneM), inner); v.position.set(0, 4.5, 0); v.scale.set(s * 1.1, 1, 1); v.rotation.y = s * 0.25; }
    scene.add(Q); return Q;
  };
  const restQ = quill(); restQ.position.set(XB + 11, 0.3, ZB + 12); restQ.rotation.set(-1.45, 0.4, 0);
  const pen = quill();

  // ---------- C: map of Thailand ----------
  const XC = -44, ZC = -8, MW = 30, MD = 40;
  const LON0 = 96, LAT1 = 20.6, PX = 98.2, PY = 100.8;
  const mx = (lon) => 60 + (lon - LON0) * PX, my = (lat) => 50 + (LAT1 - lat) * PY;
  const INS = [940, 1330, 205];
  const mapT = label(1200, 1600, (g, w, h) => {
    parchment(g, w, h, 31, "#EEDDB4", 0.3);
    g.save(); g.beginPath(); g.rect(40, 40, w - 80, h - 80); g.clip();
    g.strokeStyle = "rgba(43,76,126,.18)"; g.lineWidth = 1.4; for (let y = 50; y < h; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const poly = (rings) => { g.beginPath(); for (const rg of rings) { rg.forEach(([lo, la], i) => (i ? g.lineTo(mx(lo), my(la)) : g.moveTo(mx(lo), my(la)))); g.closePath(); } };
    for (const c of GEO) { if (c.name === "Thailand") continue; poly(c.rings); g.fillStyle = "#E9D6A8"; g.fill(); g.strokeStyle = "rgba(59,36,18,.45)"; g.lineWidth = 2; g.stroke(); }
    const th = GEO.find((c) => c.name === "Thailand");
    poly(th.rings); g.fillStyle = "rgba(214,170,92,.75)"; g.fill(); g.strokeStyle = INK; g.lineWidth = 4.5; g.stroke();
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(40, 40, w - 80, h - 80); g.lineWidth = 1.6; g.strokeRect(52, 52, w - 104, h - 104);
    inkText(g, "THAILAND", mx(102.7), my(16.1), `700 64px ${CIN}`, INK);
    inkText(g, "Teluk Thailand", mx(101.6), my(11.6), `italic 500 42px ${GAR}`, "rgba(43,60,100,.95)");
    inkText(g, "Laut Andaman", mx(97.3), my(10.4), `italic 500 38px ${GAR}`, "rgba(43,60,100,.95)");
    inkText(g, "S. Chao Phraya", mx(98.6), my(15.0), `italic 600 40px ${GAR}`, BLUEINK);
    // Bangkok
    const bx = mx(100.5), by = my(13.75);
    g.beginPath(); g.arc(bx, by, 13, 0, 6.283); g.fillStyle = GOLD; g.fill(); g.strokeStyle = INK; g.lineWidth = 3.5; g.stroke();
    inkText(g, "Bangkok", bx - 24, by + 8, `700 40px ${GAR}`, INK, "right");
    // leader to inset
    g.strokeStyle = "rgba(59,36,18,.7)"; g.setLineDash([10, 8]); g.lineWidth = 2.5; g.beginPath(); g.moveTo(bx + 14, by + 10); g.lineTo(INS[0] - INS[2] * 0.7, INS[1] - INS[2] * 0.72); g.stroke(); g.setLineDash([]);
    // inset: the river bend, west and east banks
    const [ix, iy, ir] = INS;
    g.save(); g.beginPath(); g.arc(ix, iy, ir, 0, 6.283); g.fillStyle = "#F4E6C4"; g.fill(); g.clip();
    g.fillStyle = "rgba(201,162,39,.16)"; g.fillRect(ix, iy - ir, ir, ir * 2);
    g.fillStyle = "rgba(43,76,126,.55)"; g.beginPath();
    for (let y = iy - ir; y <= iy + ir; y += 6) g.lineTo(ix - 34 + Math.sin((y - iy) * 0.016) * 46, y);
    for (let y = iy + ir; y >= iy - ir; y -= 6) g.lineTo(ix + 34 + Math.sin((y - iy) * 0.016) * 46, y);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); for (let y = iy - ir; y <= iy + ir; y += 6) g.lineTo(ix + k * 10 + Math.sin((y - iy) * 0.016) * 46 + Math.sin(y * 0.2) * 2, y); g.stroke(); }
    g.restore();
    g.beginPath(); g.arc(ix, iy, ir, 0, 6.283); g.strokeStyle = GOLD; g.lineWidth = 9; g.stroke(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    inkText(g, "TEPI", ix - 120, iy - 26, `700 34px ${CIN}`, INK); inkText(g, "BARAT", ix - 120, iy + 12, `700 34px ${CIN}`, INK);
    inkText(g, "TEPI", ix + 122, iy + 76, `700 34px ${CIN}`, LAC); inkText(g, "TIMUR", ix + 122, iy + 114, `700 34px ${CIN}`, LAC);
    inkText(g, "Bangkok, diperbesar", ix, iy - ir - 18, `italic 600 36px ${GAR}`, INK);
    // compass rose
    g.save(); g.translate(170, 200); g.fillStyle = INK; for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -70); g.lineTo(12, 0); g.lineTo(-12, 0); g.closePath(); g.fill(); }
    g.beginPath(); g.arc(0, 0, 9, 0, 6.283); g.fillStyle = GOLD; g.fill(); g.restore(); inkText(g, "U", 170, 112, `700 30px ${CIN}`, INK);
    inkText(g, "ilustrasi · aliran sungai disederhanakan", w / 2, h - 66, `italic 500 30px ${GAR}`, "rgba(59,36,18,.8)");
  });
  const mapS = sheet(MW, MD, mapT, XC, ZC, 0);
  const mapLocal = (px, py) => new THREE.Vector3((px - 600) / 40, 0.2, (py - 800) / 40);
  const RIVER = [[98.98, 18.79], [99.0, 18.2], [99.05, 17.6], [99.13, 16.88], [99.52, 16.48], [99.9, 15.95], [100.12, 15.70], [100.12, 15.40], [100.13, 15.18], [100.28, 15.0], [100.40, 14.89], [100.45, 14.59], [100.57, 14.35], [100.53, 14.02], [100.50, 13.86], [100.49, 13.72], [100.58, 13.55], [100.59, 13.47]];
  const rCurve = new THREE.CatmullRomCurve3(RIVER.map(([lo, la]) => mapLocal(mx(lo), my(la))));
  const rGeo = new THREE.TubeGeometry(rCurve, 220, 0.16, 6, false);
  const river = add(new THREE.Mesh(rGeo, std({ color: 0x2b4c7e, roughness: 0.25, metalness: 0.1, envMapIntensity: ENV * 2 })), mapS, false);
  rGeo.setDrawRange(0, 0);
  // crown token for the east bank of the inset
  const crown = G(0, 0, 0, mapS);
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 1.0, 24), goldM), crown).position.y = 0.5;
  for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283; const c = add(new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.5, 8), goldM), crown); c.position.set(Math.cos(a) * 1.05, 1.6, Math.sin(a) * 1.05); }
  add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), std({ color: 0x9c1b2a, roughness: 0.15, metalness: 0.1, envMapIntensity: ENV * 3 })), crown).position.y = 1.2;
  const crownAt = mapLocal(INS[0] + 100, INS[1] - 40);
  // wax seal helper
  const waxM = std({ color: 0x8e1b1b, roughness: 0.42, envMapIntensity: ENV * 1.6 });
  const sealGeo = (rad, seed) => { const g = new THREE.CylinderGeometry(rad, rad * 1.08, 0.7, 64, 1); const p = g.attributes.position, q = mulberry(seed); const n = []; for (let k = 0; k < 64; k++) n.push(0.9 + q() * 0.22); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = Math.floor(((a + Math.PI) / 6.283) * 64) % 64, rr = Math.hypot(x, z); if (rr > 0.01) { p.setX(i, x * n[k]); p.setZ(i, z * n[k]); } } g.computeVertexNormals(); return g; };
  const seal = (rad, paint, seed, p) => {
    const S = G(0, 0, 0, p);
    add(new THREE.Mesh(sealGeo(rad, seed), waxM), S).position.y = 0.35;
    const tx = label(512, 512, paint);
    const face = new THREE.Mesh(new THREE.CircleGeometry(rad * 0.86, 48), std({ map: tx, bumpMap: tx, bumpScale: 2.2, roughness: 0.4, envMapIntensity: ENV * 1.6 }));
    face.rotation.x = -Math.PI / 2; face.position.y = 0.72; face.castShadow = false; S.add(face);
    return S;
  };
  const sealPaint = (top, mid, bot, midFont) => (g, w, h) => {
    g.fillStyle = "#8E1B1B"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5A0E0E"; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, w * 0.43, 0, 6.283); g.stroke();
    g.strokeStyle = "#C84A3E"; g.lineWidth = 4; g.beginPath(); g.arc(w / 2 - 3, h / 2 - 3, w * 0.43, 0, 6.283); g.stroke();
    const emb = (txt, y, font) => { g.font = font; g.textAlign = "center"; g.fillStyle = "#4A0A0A"; g.fillText(txt, w / 2 + 4, y + 4); g.fillStyle = "#D2604F"; g.fillText(txt, w / 2 - 2, y - 2); g.fillStyle = "#9E2620"; g.fillText(txt, w / 2, y); };
    if (top) emb(top, h * 0.33, `700 54px ${CIN}`);
    emb(mid, h * 0.6, midFont);
    if (bot) emb(bot, h * 0.78, `700 44px ${CIN}`);
  };
  const seal1782 = seal(3.0, sealPaint("IBU KOTA", "1782", "", `700 150px ${GAR}`), 5, mapS);
  const sealAt = mapLocal(INS[0] - 30, INS[1] - 300);

  // ---------- D: illuminated panel on a lectern ----------
  const XD = 44, ZD = -44;
  const ROUND = [[260, 340, "kota para", "malaikat"], [780, 340, "kota agung", "para abadi"], [200, 730, "takhta", "raja"], [840, 730, "istana", "kerajaan"], [260, 1120, "rumah para dewa", "yang menjelma"], [780, 1120, "Wishwakarma,", "titah Dewa Indra"]];
  const icon = (g, k, x, y) => {
    g.save(); g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 4; g.fillStyle = "rgba(201,162,39,.85)"; g.lineJoin = "round";
    if (k === 0) { for (const s of [-1, 1]) for (let f = 0; f < 5; f++) { g.beginPath(); g.ellipse(s * (22 + f * 11), -10 + f * 9, 44 - f * 5, 10, s * (0.5 - f * 0.18), 0, 6.283); g.fill(); g.stroke(); } g.beginPath(); g.arc(0, -4, 12, 0, 6.283); g.fillStyle = "#F7EBCF"; g.fill(); g.stroke(); }
    if (k === 1) { for (let f = -2; f <= 2; f++) { g.beginPath(); g.ellipse(f * 20, 10 - Math.abs(f) * 4, 14, 44, f * 0.32, 0, 6.283); g.fill(); g.stroke(); } g.beginPath(); g.moveTo(-70, 48); g.lineTo(70, 48); g.stroke(); }
    if (k === 2) { g.beginPath(); g.moveTo(-40, 60); g.lineTo(-40, -20); g.lineTo(-28, -60); g.lineTo(0, -78); g.lineTo(28, -60); g.lineTo(40, -20); g.lineTo(40, 60); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "rgba(142,27,27,.8)"; g.fillRect(-52, 10, 104, 18); g.strokeRect(-52, 10, 104, 18); }
    if (k === 3) { g.fillRect(-64, 10, 128, 52); g.strokeRect(-64, 10, 128, 52); for (let f = 0; f < 3; f++) { g.beginPath(); g.moveTo(-78 + f * 14, 14 - f * 26); g.lineTo(0, -32 - f * 26); g.lineTo(78 - f * 14, 14 - f * 26); g.closePath(); g.fillStyle = f % 2 ? "rgba(201,162,39,.85)" : "rgba(142,27,27,.8)"; g.fill(); g.stroke(); } g.beginPath(); g.moveTo(0, -84); g.lineTo(0, -104); g.stroke(); }
    if (k === 4) { for (let f = 0; f < 5; f++) { const ww = 58 - f * 11; g.beginPath(); g.rect(-ww, 50 - f * 26, ww * 2, 24); g.fill(); g.stroke(); } g.beginPath(); g.moveTo(0, -80); g.lineTo(0, -104); g.stroke(); }
    if (k === 5) { g.beginPath(); g.moveTo(-50, 60); g.lineTo(-12, -60); g.lineTo(26, 60); g.stroke(); g.beginPath(); g.arc(-12, -60, 8, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.moveTo(42, -64); g.lineTo(20, 2); g.lineTo(46, 0); g.lineTo(26, 66); g.lineTo(66, -10); g.lineTo(40, -8); g.lineTo(60, -64); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  };
  const illT = label(1040, 1360, (g, w, h) => {
    parchment(g, w, h, 53, "#F3E5C3", 0.24);
    g.strokeStyle = GOLD; g.lineWidth = 16; g.strokeRect(30, 30, w - 60, h - 60);
    g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44); g.strokeRect(40, 40, w - 80, h - 80);
    g.strokeStyle = "rgba(142,27,27,.9)"; g.lineWidth = 3; g.strokeRect(58, 58, w - 116, h - 116);
    const q = mulberry(9);
    for (let i = 0; i < 70; i++) { const side = i % 4, u = q(); const x = side < 2 ? 60 + u * (w - 120) : side === 2 ? 44 : w - 44, y = side >= 2 ? 60 + u * (h - 120) : side === 0 ? 44 : h - 44; g.beginPath(); g.arc(x, y, 5, 0, 6.283); g.fillStyle = i % 3 ? GOLD : "#2E4F8C"; g.fill(); }
    inkText(g, "ARTINYA", w / 2, 128, `700 56px ${CIN}`, LAC);
    for (const [k, [x, y, l1, l2]] of ROUND.entries()) {
      g.beginPath(); g.arc(x, y, 118, 0, 6.283); g.fillStyle = k % 2 ? "rgba(46,79,140,.16)" : "rgba(142,27,27,.1)"; g.fill();
      icon(g, k, x, y - 8);
      inkText(g, l1, x, y + 160, `italic 600 38px ${GAR}`, INK);
      inkText(g, l2, x, y + 200, `italic 600 38px ${GAR}`, INK);
    }
    inkText(g, "sembilan", w / 2, 730 + 175, `italic 600 38px ${GAR}`, INK);
    inkText(g, "permata", w / 2, 730 + 215, `italic 600 38px ${GAR}`, INK);
  });
  const lect = G(XD, 0, ZD);
  add(new THREE.Mesh(new THREE.BoxGeometry(30, 1.2, 12), darkWood), lect).position.set(0, 0.6, -2);
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 12, 2.2), darkWood), lect).position.set(s * 10, 6, -6);
  blob(36, 20, XD + 1, ZD - 2, 0.75);
  const board = G(0, 13, -2, lect); board.rotation.x = -0.62;
  add(new THREE.Mesh(new THREE.BoxGeometry(28.6, 37, 1.1), darkWood), board).position.z = -0.6;
  add(new THREE.Mesh(new THREE.BoxGeometry(28.6, 1.2, 2.2), darkWood), board).position.set(0, -18.2, 0.6);
  const ill = add(new THREE.Mesh(new THREE.PlaneGeometry(26, 34), std({ map: illT, color: 0xe6d6b6, roughness: 0.78, bumpMap: illT, bumpScale: 0.3 })), board, false);
  ill.position.z = 0.02;
  const bl = (cx, cy) => [(cx - 520) / 40, (680 - cy) / 40];
  const rings = [], glows = [];
  for (const [x, y] of ROUND) {
    const [lx, ly] = bl(x, y - 8);
    const tr = add(new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.2, 10, 64), goldM.clone()), board); tr.position.set(lx, ly, 0.2); rings.push(tr);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 9.5), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); gl.position.set(lx, ly, 0.4); board.add(gl); glows.push(gl);
  }
  const GEMC = [0xf2f6ff, 0xc8102e, 0x1c9a58, 0xf2c230, 0xb5541d, 0x1f4fbf, 0xe8e2d0, 0x9a8f3a, 0xe0603a];
  const gemRing = G(...bl(520, 722), 0.9, board);
  const gemTorus = add(new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.22, 10, 72), goldM), gemRing);
  const gems = GEMC.map((c, k) => {
    const a = (k / 9) * 6.283 + Math.PI / 2;
    const m = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.06, metalness: 0.05, clearcoat: 1, envMapIntensity: 1.6, emissive: c, emissiveIntensity: 0.18, flatShading: true })), gemRing);
    m.position.set(Math.cos(a) * 3.6, Math.sin(a) * 3.6, 0.6); m.scale.set(1, 1.25, 0.8);
    return m;
  });
  const gemGlow = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); gemGlow.position.z = 0.3; gemRing.add(gemGlow);
  // gold leaf flakes on the lectern base
  { const q = mulberry(77); for (let i = 0; i < 26; i++) { const f = add(new THREE.Mesh(new THREE.PlaneGeometry(0.6 + q(), 0.5 + q() * 0.8), goldM), lect, false); f.rotation.set(-Math.PI / 2, 0, q() * 6); f.position.set((q() * 2 - 1) * 13, 1.22, -2 + (q() * 2 - 1) * 5); } }

  // ---------- E: brass record plaque ----------
  const XE = 44, ZE2 = 2;
  const brassT = label(1200, 760, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#E2BE6A"); gr.addColorStop(0.5, "#C99B3E"); gr.addColorStop(1, "#E6C878"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(3); for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "255,240,200" : "90,60,20"},${0.05 + q() * 0.07})`; g.lineWidth = 1; const y = q() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (q() - 0.5) * 4); g.stroke(); }
    const eng = (txt, x, y, font) => { g.font = font; g.textAlign = "center"; g.fillStyle = "rgba(255,245,210,.7)"; g.fillText(txt, x + 2, y + 3); g.fillStyle = "#3A260C"; g.fillText(txt, x, y); };
    g.strokeStyle = "#3A260C"; g.lineWidth = 6; g.strokeRect(34, 34, w - 68, h - 68); g.lineWidth = 2; g.strokeRect(52, 52, w - 104, h - 104);
    for (const [x, y] of [[80, 80], [w - 80, 80], [80, h - 80], [w - 80, h - 80]]) { g.beginPath(); g.arc(x, y, 12, 0, 6.283); g.fillStyle = "#8A6424"; g.fill(); g.strokeStyle = "#3A260C"; g.lineWidth = 3; g.stroke(); }
    eng("GUINNESS WORLD RECORDS", w / 2, 150, `700 46px ${CIN}`);
    eng("NAMA TEMPAT TERPANJANG", w / 2, 252, `700 68px ${CIN}`);
    eng("DI DUNIA", w / 2, 336, `700 68px ${CIN}`);
    eng("168", w / 2 - 150, 560, `700 230px ${GAR}`);
    eng("HURUF", w / 2 + 190, 540, `700 100px ${CIN}`);
    eng("Krung Thep Maha Nakhon …", w / 2, 660, `italic 500 46px ${GAR}`);
  });
  const plq = G(XE, 0, ZE2);
  add(new THREE.Mesh(new THREE.BoxGeometry(30, 3, 9), darkWood), plq).position.y = 1.5;
  add(new THREE.Mesh(new THREE.BoxGeometry(31, 0.6, 10), goldM), plq).position.y = 3.1;
  blob(38, 18, XE + 1, ZE2 + 1, 0.75);
  const hinge = G(0, 3.4, 0.6, plq);
  const brassM = std({ map: brassT, metalness: 0.82, roughness: 0.32, envMapIntensity: ENV * 2.6, emissive: 0x4a3008, emissiveMap: brassT, emissiveIntensity: 0.06 });
  const plate = add(new THREE.Mesh(new THREE.BoxGeometry(26, 16.5, 0.7), [goldM, goldM, goldM, goldM, brassM, goldM]), hinge); plate.position.set(0, 8.25, 0);
  const seal168 = seal(2.4, sealPaint("", "★", "", `700 160px ${GAR}`), 9, scene);

  // ---------- F: abstract 1989 motif + short forms ----------
  const XF = 44, ZF = 40;
  const grooveT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#0B0A09"; g.fillRect(0, 0, w, h);
    for (let rr = 140; rr < 505; rr += 2.2) { g.strokeStyle = `rgba(${rr % 9 < 3 ? "70,62,55" : "30,27,24"},.9)`; g.lineWidth = 1; g.beginPath(); g.arc(w / 2, h / 2, rr, 0, 6.283); g.stroke(); }
    for (const rr of [250, 330, 410]) { g.strokeStyle = "#020202"; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, rr, 0, 6.283); g.stroke(); }
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.33); gr.addColorStop(0, "#8E1B1B"); gr.addColorStop(1, "#6E1212"); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, 140, 0, 6.283); g.fill();
    g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 128, 0, 6.283); g.stroke();
  });
  const recLabel = label(512, 512, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#F2D480"; g.textAlign = "center"; g.font = `700 120px ${GAR}`; g.fillText("1989", w / 2, h / 2 + 4); g.font = `700 38px ${CIN}`; g.fillText("LAGU ROCK", w / 2, h / 2 + 64); g.beginPath(); g.arc(w / 2, h / 2 - 90, 10, 0, 6.283); g.fill(); });
  const rec = G(XF - 6, 0, ZF - 2);
  add(new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10.5, 1.0, 64), darkWood), rec).position.y = 0.5;
  const disc = G(0, 1.2, 0, rec);
  add(new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.22, 96), [std({ color: 0x0b0a09, roughness: 0.3 }), std({ map: grooveT, roughness: 0.22, metalness: 0.2, envMapIntensity: ENV * 2.4 }), std({ color: 0x0b0a09 })]), disc);
  { const lb = new THREE.Mesh(new THREE.CircleGeometry(4.3, 48), new THREE.MeshBasicMaterial({ map: recLabel, transparent: true })); lb.rotation.x = -Math.PI / 2; lb.position.y = 0.125; disc.add(lb); }
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 12), goldM), disc).position.y = 0.3;
  blob(26, 26, XF - 5.5, ZF - 1.5, 0.7);
  // tone arm
  const arm = G(XF + 6.5, 1.0, ZF - 10, scene);
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.4, 24), goldM), arm).position.y = 1.2;
  const armBar = add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 13, 10), goldM), arm); armBar.rotation.set(Math.PI / 2, 0, 0); armBar.position.set(0, 2.5, 6.5);
  // sound-wave row: gold bars on a parchment strip
  const NB = 37, waveG = G(XF, 0, ZF - 17);
  const stripT = label(1600, 160, (g, w, h) => { parchment(g, w, h, 61, "#EAD6A8", 0.35); g.strokeStyle = LAC; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16); });
  { const s = add(new THREE.Mesh(new THREE.BoxGeometry(34, 0.2, 3.4), std({ map: stripT, roughness: 0.85 })), waveG); s.position.y = 0.1; }
  const bars = [];
  for (let i = 0; i < NB; i++) { const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 1, 0.55), goldM), waveG); b.position.x = (i - (NB - 1) / 2) * 0.88; bars.push(b); }
  blob(38, 8, XF, ZF - 16.5, 0.55);
  // tile racks
  const tileT = (txt, sub, w, h, seed) => label(w, h, (g, W2, H2) => {
    parchment(g, W2, H2, seed, "#E3D2AE", 0.25);
    g.strokeStyle = GOLD; g.lineWidth = 10; g.strokeRect(10, 10, W2 - 20, H2 - 20);
    g.font = `700 ${sub ? 120 : 150}px ${CIN}`; g.textAlign = "center"; g.fillStyle = INK; g.fillText(txt, W2 / 2, sub ? H2 * 0.52 : H2 * 0.66);
    if (sub) { g.font = `italic 600 64px ${GAR}`; g.fillStyle = LAC; g.fillText(sub, W2 / 2, H2 * 0.84); }
  });
  const ivory = std({ color: 0xcdbd9c, roughness: 0.5 });
  const rack = (z) => { const R = G(XF, 0, z); add(new THREE.Mesh(new THREE.BoxGeometry(26, 1.4, 4.2), darkWood), R).position.y = 0.7; add(new THREE.Mesh(new THREE.BoxGeometry(26, 2.4, 0.8), darkWood), R).position.set(0, 1.9, -1.6); blob(30, 8, XF, z, 0.6); return R; };
  const rack1 = rack(ZF + 12), rack2 = rack(ZF + 21);
  const mkTile = (R, tx, w, h, x) => { const P = G(x, 1.4, 0.2, R); P.rotation.x = -0.32; const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.9), [ivory, ivory, ivory, ivory, std({ map: tx, color: 0xd8c8a8, roughness: 0.55 }), ivory]), P); m.position.y = h / 2; return P; };
  const tKT = mkTile(rack1, tileT("KRUNG THEP", "Kota Malaikat", 1400, 400, 81), 22, 6.3, 0);
  const tKo = [["KO", -7.6], ["THO", 0], ["MO", 7.6]].map(([s, x], i) => mkTile(rack2, tileT(s, "", 420, 400, 90 + i), 6.4, 6.1, x));

  // ---------- G: AUDIRA wax seal on the colophon ----------
  const sealA = seal(3.6, sealPaint("", "AUDIRA", "", `700 98px ${CIN}`), 21, scene);
  const ribbonM = std({ color: 0x6e1212, roughness: 0.6 });
  const ribbons = [-1, 1].map((s) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 7), ribbonM), scene, false); m.rotation.y = s * 0.35; return m; });

  // ---------- candles ----------
  const waxCandle = std({ color: 0xf2e3c4, roughness: 0.55 });
  const CANDLES = [[-21, -70, 13], [22, -66, 9], [-64, 22, 11], [66, -20, 12], [24, 66, 10], [76, 26, 8]];
  const flames = CANDLES.map(([x, z, hgt], i) => {
    const C = G(x, 0, z);
    add(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 32), goldM), C).position.y = 0.4;
    add(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.75, hgt, 32), waxCandle), C).position.y = 0.8 + hgt / 2;
    const q = mulberry(100 + i);
    for (let k = 0; k < 4; k++) { const a = q() * 6.283, d = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.5 + q() * 2, 4, 8), waxCandle), C); d.position.set(Math.cos(a) * 1.68, 0.8 + hgt - 1.2 - q(), Math.sin(a) * 1.68); }
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), std({ color: 0x111111 })), C).position.y = 0.8 + hgt + 0.3;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd08a })); f.scale.set(1, 2.4, 1); f.position.y = 0.8 + hgt + 1.2; C.add(f);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(9, 11, 1); halo.position.y = f.position.y; C.add(halo);
    const L = new THREE.PointLight(0xffad55, 0, 95, 1.2); L.position.set(x, 0.8 + hgt + 2.5, z); scene.add(L);
    blob(9, 9, x, z, 0.6);
    return { f, halo, L, ph: i * 1.7 };
  });

  // dust in candle light
  const dust = pts(scene, 180, { color: 0xffd7a0, size: 0.35, opacity: 0.5 });
  const dq = mulberry(5); const dSeed = Array.from({ length: 180 }, () => [dq() * 2 - 1, dq(), dq() * 2 - 1, dq() * 6.283, 0.2 + dq() * 0.5]);

  // ---------- timing ----------
  const tW0 = 0.3, tW1 = A("s1:huruf") - 0.05, dW = (tW1 - tW0) / NAME.length;
  const writeU = (i, t) => clamp01((t - tW0 - i * dW) / (dW * 0.92));
  const rollZ = (t) => { const p = (t - tW0) / dW, z = lineZ(p) + 9, lo = ZH + 10; if (z <= lo) return lo; const k = 3; return ZE - k * Math.log(1 + Math.exp((ZE - z) / k)) * (z < ZE + 40 ? 1 : 0); };
  const s4At = ["s4:Krung", "s4:Thep", "s4:Maha", "s4:Nakhon", "s4:Amon", "s4:Rattanakosin", "s4:Mahintharayutthaya"].map(A);
  const s4Rest = [A("s4:dan"), K.s4e + 0.2];
  const gleamAt = (i) => (i < 7 ? s4At[i] : s4Rest[0] + (i - 7) / (NAME.length - 7) * (s4Rest[1] - s4Rest[0]));
  const RW = ["s5:malaikat", "s5:abadi", "s5:takhta", "s5:istana", "s5:dewa", "s5:Wishwakarma"].map(A);
  const tGem = A("s5:sembilan"), tPerm = A("s5:permata"), tIndra = A("s5:Indra");

  // ---------- camera ----------
  const cv = (tx, ty, tz, d, el, yaw = 0) => { const e = el * Math.PI / 180; return [tx + d * Math.cos(e) * Math.sin(yaw), ty + d * Math.sin(e), tz + d * Math.cos(e) * Math.cos(yaw), tx, ty, tz]; };
  const H = A("s1:huruf"), Bk = A("s1:Bangkok");
  const TAGX = -17;
  const keys = [
    [0, ...cv(0, 0, -45, 64, 57, 0.0)],
    [tW0 + (H - tW0) * 0.4, ...cv(0, 0, -26, 82, 58, 0.02)],
    [H - 0.2, ...cv(0, 0, 0, 150, 62, 0.02)],
    [H + 0.35, ...cv(0, 0, 3, 156, 62, 0.0)],
    [Bk - 0.05, ...cv(TAGX + 2, 0, 60, 58, 56, 0.1)],
    [A("s2:Kata") - 0.3, ...cv(TAGX + 2, 0, 60, 52, 57, 0.06)],
    [A("s2:Kata") + 0.9, ...cv(XB, 0, ZB, 60, 60, 0.04)],
    [K.s2e, ...cv(XB, 0, ZB, 54, 62, -0.02)],
    [K.s3 + 0.05, ...cv(XB, 0, ZB - 1, 54, 62, -0.02)],
    [A("s3:ibu") + 0.2, ...cv(XC + 1, 0, ZC + 4, 84, 64, 0)],
    [A("s3:Sungai") - 0.1, ...cv(XC, 0, ZC + 4, 78, 64, 0)],
    [A("s3:1782") + 0.3, ...cv(XC + 9, 0, ZC + 10, 48, 66, 0)],
    [A("s3:Sejak") - 0.05, ...cv(XC + 9.5, 0, ZC + 10.5, 45, 66, 0)],
    [A("s3:Mongkut") + 0.7, ...cv(0, 0, -38, 92, 60, 0)],
    [K.s4, ...cv(0, 0, -36, 96, 60, 0)],
    [A("s4:dan") - 0.1, ...cv(0, 0, -33, 96, 60, 0)],
    [K.s4e, ...cv(0, 0, -6, 76, 58, 0)],
    [A("s5:kota") - 0.15, ...cv(XD, 13, ZD, 78, 33, 0)],
    [tGem - 0.3, ...cv(XD, 13, ZD, 72, 33, 0.02)],
    [tPerm + 0.25, ...cv(XD, 13, ZD, 46, 33, 0)],
    [A("s5:takhta") + 0.4, ...cv(XD, 13, ZD, 72, 33, -0.03)],
    [tIndra + 0.25, ...cv(XD, 13, ZD, 68, 33, 0.03)],
    [K.s6 + 1.0, ...cv(XE, 10, ZE2, 84, 18, 0)],
    [A("s6:seratus") - 0.15, ...cv(XE, 10, ZE2, 80, 18, 0)],
    [A("s6:seratus") + 0.25, ...cv(XE, 9.5, ZE2, 66, 15, 0)],
    [K.s6e, ...cv(XE, 9.5, ZE2, 64, 15, 0)],
    [K.s7 + 1.3, ...cv(XF, 1, ZF - 6, 66, 46, 0)],
    [A("s7:Sehari-hari") - 0.2, ...cv(XF, 1, ZF - 5, 62, 46, 0.03)],
    [A("s7:Krung") - 0.1, ...cv(XF, 3, ZF + 15, 72, 38, 0)],
    [K.s7e, ...cv(XF, 3, ZF + 16, 70, 38, 0)],
    [A("s8:panggilan") - 0.2, ...cv(0, 0, ZE - 9, 58, 60, 0)],
    [A("s8:Menurut"), ...cv(0, 0, ZE - 9, 60, 60, 0)],
    [A("s8:Menurut") + 4.6, ...cv(0, 0, -2, 236, 64, 0)],
    [K.dur, ...cv(0, 0, -2, 246, 64, 0)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3(), tmp = new THREE.Vector3();
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Cinzel"`) && document.fonts.check(`500 40px "EB Garamond"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.3, c[1] + Math.sin(t * 0.29) * 0.2, c[2] + Math.cos(t * 0.31) * 0.25);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.target.position.copy(tgt); key.position.set(tgt.x - 70, 120, tgt.z + 60);

    // A: unroll, write, gleam
    const rz = Math.max(ZH + 10, rollZ(t)), uR = (rz - ZH - 10) / (LEN - 10);
    clip.constant = rz + 0.05;
    const rad = 3.2 - 1.6 * uR;
    tail.R.position.set(0, rad, rz); tail.body.scale.set(rad / 3.2, 1, rad / 3.2);
    tail.R.rotation.x = -(rz - ZH) / 2.4;
    tailBlob.position.z = rz; tailBlob.scale.set(1, 1, 0.6 + rad / 3.2);
    let head2 = null;
    for (let i = 0; i < words.length; i++) {
      const o = words[i], ww = wordW(o), u = writeU(i, t);
      o.mesh.position.x = -ww / 2;
      o.mesh.scale.x = Math.max(0.001, ww * u);
      o.tex.repeat.x = Math.max(0.0005, o.st.tw / 2048 * u);
      o.mesh.visible = u > 0.001;
      if (u > 0 && u < 1) head2 = [o, ww, u];
      const gl = pump(t, gleamAt(i) - 0.05, 0.12, 0.8) + (t > s4At[0] - 0.3 && t < K.s5 ? 0.12 : 0) + (u > 0 && u < 1 ? 0.5 : 0);
      o.mesh.material.emissiveIntensity = 0.05 + 0.45 * gl;
    }
    // the quill rides the write head, then rests beside the scroll head
    const wEnd = clamp01((t - tW1 - 0.1) / 0.8);
    if (head2) {
      const [o, ww, u] = head2;
      pen.position.set(-ww / 2 + ww * u, o.mesh.position.y + 0.15 + Math.abs(Math.sin(t * 38)) * 0.25, o.z + 0.5);
      pen.rotation.set(-0.25, 0.5, 0);
      gleam.position.set(pen.position.x + 2, pen.position.y + 6, pen.position.z + 3); gleam.intensity = 4;
    } else if (t < tW0) {
      pen.position.set(-wordW(words[0]) / 2, words[0].mesh.position.y + 0.4, words[0].z + 0.5); pen.rotation.set(-0.25, 0.5, 0); gleam.intensity = 3; gleam.position.set(pen.position.x + 2, 6, pen.position.z + 3);
    } else {
      const k = smooth(wEnd), z0 = words[words.length - 1].z + 0.5;
      pen.position.set(-8 * (1 - k) + 17 * k, 0.4 + 6 * Math.sin(Math.PI * k) * (1 - 0.5 * k), z0 * (1 - k) + (ZH + 4) * k * 0 + (z0 - 6) * k);
      pen.rotation.set(-0.25 - 1.1 * k, 0.5 + 0.2 * k, 0);
      // gleam sweeps the line being read in s4
      let gi = -1; for (let i = 0; i < words.length; i++) if (t >= gleamAt(i) - 0.1 && t < gleamAt(i) + 0.7) gi = i;
      if (gi >= 0) { const o = words[gi]; gleam.position.set(-6 + 12 * clamp01((t - gleamAt(gi)) / 0.7), 6, o.z + 2); gleam.intensity = 4; } else gleam.intensity = 0;
    }
    // BANGKOK tag follows the lower roller; struck through on "Bangkok"; note on s2 "Bangkok"
    tag.position.set(TAGX, 0, rz + 7.5); tag.rotation.y = 0.08;
    tagBlob.position.set(TAGX + 0.6, 0.03, rz + 8);
    const uS = eout(clamp01((t - Bk + 0.05) / 0.45));
    strike.scale.x = Math.max(0.001, 10.4 * uS); strike.visible = uS > 0.002;
    const uN = eout(clamp01((t - A("s2:Bangkok") + 0.1) / 0.8));
    note.scale.x = Math.max(0.001, 16 * uN); noteT.repeat.x = Math.max(0.001, uN); note.visible = uN > 0.002;
    if (!cord || cord.userData.z !== +rz.toFixed(2)) {
      if (cord) { scene.remove(cord); cord.geometry.dispose(); }
      const a = new THREE.Vector3(-(W / 2 + 3), rad, rz), b = new THREE.Vector3(TAGX - 6.6, 0.4, rz + 7.5);
      const mid = a.clone().lerp(b, 0.5); mid.y = 0.3;
      cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 24, 0.16, 6), cordM); cord.castShadow = true; cord.userData.z = +rz.toFixed(2); scene.add(cord);
    }

    // C: river draws in, crown on the east bank, 1782 seal
    const uRiv = smooth(clamp01((t - A("s3:Sungai") + 0.4) / 1.6));
    rGeo.setDrawRange(0, Math.floor(uRiv * 220) * 36);
    river.visible = uRiv > 0.001;
    const tC = A("s3:timur");
    const dC = clamp01((t - tC + 0.35) / 0.4);
    crown.position.set(crownAt.x, 0.15 + 9 * (1 - eout(dC)), crownAt.z); crown.visible = dC > 0;
    crown.rotation.y = 0.6 * (1 - dC) + t * 0.15;
    const t17 = A("s3:1782");
    const d17 = clamp01((t - t17 + 0.25) / 0.25);
    seal1782.position.set(sealAt.x, 0.15 + 12 * (1 - d17 * d17), sealAt.z); seal1782.visible = d17 > 0;
    seal1782.scale.set(1 + 0.12 * pump(t, t17, 0.02, 0.25), 1 - 0.3 * pump(t, t17, 0.02, 0.25), 1 + 0.12 * pump(t, t17, 0.02, 0.25));
    seal1782.rotation.y = -0.2;

    // D: roundels light up per meaning, the nine gems pop in and turn
    rings.forEach((m, k) => { const p = pump(t, RW[k] - 0.1, 0.15, 1.6), on = t > RW[k] ? 1 : 0; m.material.emissiveIntensity = 0.6 + 2.2 * p + 0.6 * on; glows[k].material.opacity = 0.75 * p + 0.16 * on; });
    rings[5].material.emissiveIntensity += 2.2 * pump(t, tIndra - 0.1, 0.15, 1.4); glows[5].material.opacity += 0.6 * pump(t, tIndra - 0.1, 0.15, 1.4);
    gems.forEach((m, k) => { const u = back(clamp01((t - tGem - k * 0.07) / 0.35), 1.8); m.scale.set(u, 1.25 * u, 0.8 * u); m.visible = u > 0.001; m.rotation.y = t * 0.8 + k; m.rotation.z = Math.sin(t * 0.6 + k) * 0.1; });
    gemGlow.material.opacity = 0.7 * pump(t, tPerm - 0.1, 0.15, 1.8) + (t > tGem ? 0.12 : 0);
    gemTorus.material.emissiveIntensity = 0.6;

    // E: plaque rises from flat on "Guinness"; star seal lands on "huruf"
    const uP = back(clamp01((t - A("s6:Guinness") + 0.4) / 0.85), 1.2);
    hinge.rotation.x = -Math.PI / 2 * (1 - uP) - 0.1 * uP;
    const tH = A("s6:huruf"), dH = clamp01((t - tH + 0.25) / 0.25);
    tmp.set(9.6, 4.1, 0.75); plate.localToWorld(tmp);
    seal168.position.set(tmp.x, tmp.y - 0.35, tmp.z + 0.3 + 10 * (1 - dH * dH)); seal168.rotation.set(Math.PI / 2 - 0.1, 0, 0); seal168.visible = dH > 0;

    // F: record spins, wave row pulses (abstract), tiles stand up
    disc.rotation.y = -t * 2.4;
    const tL = A("s7:lagu"), uW = smooth(clamp01((t - tL + 0.3) / 0.6)) * (1 - 0.65 * smooth(clamp01((t - A("s7:Sehari-hari")) / 1.2)));
    arm.rotation.y = -0.35 * smooth(clamp01((t - tL + 0.4) / 0.8));
    bars.forEach((b, i) => {
      const x = (i - (NB - 1) / 2) / NB;
      const v = 0.5 + 0.5 * Math.sin(t * 7.1 + i * 0.7) * Math.sin(t * 2.3 + i * 0.31) + 0.25 * Math.sin(t * 11.3 + i * 1.9);
      const h = 0.25 + uW * (1.2 + 7.5 * Math.max(0, v) * (1 - 1.6 * x * x));
      b.scale.y = h; b.position.y = 0.2 + h / 2;
    });
    const tK = A("s7:Krung");
    tKT.visible = t > tK - 0.32; tKT.rotation.x = -0.32 - (Math.PI / 2 - 0.32) * (1 - back(clamp01((t - tK + 0.3) / 0.55), 1.5));
    tKo.forEach((P, i) => { const ta = A(["s7:Ko", "s7:Tho", "s7:Mo"][i]); P.visible = t > ta - 0.27; P.rotation.x = -0.32 - (Math.PI / 2 - 0.32) * (1 - back(clamp01((t - ta + 0.25) / 0.45), 1.7)); });

    // G: AUDIRA seal presses onto the colophon
    const tA = A("s8:panggilan"), dA = clamp01((t - tA + 0.3) / 0.3);
    const zA = ZE - 9.5 + 3.4;
    sealA.position.set(0, paperY(0, zA) + 0.05 + 12 * (1 - dA * dA), zA); sealA.visible = dA > 0;
    const sq = pump(t, tA, 0.02, 0.3); sealA.scale.set(1 + 0.12 * sq, 1 - 0.3 * sq, 1 + 0.12 * sq); sealA.rotation.y = 0.12;
    ribbons.forEach((m, k) => { m.position.set((k ? 1 : -1) * 1.6, paperY(0, zA) + 0.1, zA + 4.2); m.visible = dA >= 1; });

    // candles
    for (const f of flames) {
      const fl = 0.82 + 0.1 * Math.sin(t * 9.3 + f.ph) + 0.06 * Math.sin(t * 23.7 + f.ph * 2) + 0.04 * Math.sin(t * 3.1 + f.ph);
      f.L.intensity = 7 * fl; f.f.scale.set(1, 2.4 * (0.9 + 0.15 * fl), 1); f.halo.material.opacity = 0.45 * fl;
      f.f.position.x = Math.sin(t * 5.3 + f.ph) * 0.05;
    }
    const d = dust.pos;
    for (let i = 0; i < 180; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 40 + Math.sin(t * q[4] + q[3]) * 1.2; d[i * 3 + 1] = 1 + ((q[1] * 26 + t * q[4] * 0.5) % 26); d[i * 3 + 2] = tgt.z + q[2] * 40 + 6 + Math.cos(t * q[4] + q[3]) * 1.2; }
    dust.commit();
    comp.render();
  };
}
