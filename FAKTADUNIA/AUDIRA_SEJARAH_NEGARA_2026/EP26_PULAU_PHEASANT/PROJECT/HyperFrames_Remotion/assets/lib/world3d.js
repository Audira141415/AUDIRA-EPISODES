// EP26 PULAU PHEASANT: TERRARIUM. The tiny river island lives inside a corked glass jar on a walnut plinth
// (units ~ jar: glass radius 8.05, island 10 x 2 = 200 x 40 m, water level y 3.05).
//   jar      real transmissive glass + fresnel rim, condensation beads, substrate bands, cork lid
//   inside   the Bidasoa channel along x, Spanish bank in front (Irun), French bank behind (Hendaye), the island in
//            the middle: moss cushions, ferns, trees, the 1659 monolith, a flagpole whose flag flips Spain/France
//   ring     a calendar dial around the jar base (12 months, Feb-Jul Spain, Aug-Jan France) that turns under a
//            brass "HARI INI" pointer; every turn flips the flag and the island tint
//   plinth   brass AUDIRA plate (brand inside the world)
// Beats: river + 200 x 40 m rulers, 1659 table with de Haro and Mazarin, Louis XIV and Maria Theresa, the viceroy
// badge + Pierre Loti, Irun and Hendaye, no-entry sign, cleaner, patrol boat, struck-through pheasant.
// Everything is a function of t.

const FONTS = ['700 80px "Fraunces"', '600 80px "Fraunces"', '600 80px "IBM Plex Mono"', '700 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "Pulau 1659 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, clamp01, smooth, eout, back, canvasTex, stage } from "./lib3d.js";

const V3 = THREE.Vector3;
const ENV = 0.55;
const FR = '"Fraunces", Georgia, serif', MONO = '"IBM Plex Mono", "Courier New", monospace';
const ES_R = "#C8102E", ES_Y = "#F1BF00", FR_B = "#2B4BA0", FR_R = "#E1000F";
const MOSS = "#4F7A3A", INK = "#2A2117", PAPER = "#F3E9D2";
const RIN = 7.82, RG = 8.05, WATER = 3.05;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

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

// Rounded box (RoundedBoxGeometry construction): middle segment stretched, outer segments bent on quarter circles.
const rbC = {};
function rb(w, h, d, r = 0.1, seg = 3) {
  const key = [w, h, d, r, seg].join();
  if (rbC[key]) return rbC[key];
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const S = seg * 2 + 1, hs = 0.5 / S;
  const g = new THREE.BoxGeometry(1, 1, 1, S, S, S);
  const pa = g.attributes.position, na = g.attributes.normal;
  const bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r, p = new V3(), n = new V3();
  for (let i = 0; i < pa.count; i++) {
    p.fromBufferAttribute(pa, i);
    n.set(p.x - Math.sign(p.x) * hs, p.y - Math.sign(p.y) * hs, p.z - Math.sign(p.z) * hs).normalize();
    pa.setXYZ(i, Math.sign(p.x) * bx + n.x * r, Math.sign(p.y) * by + n.y * r, Math.sign(p.z) * bz + n.z * r);
    na.setXYZ(i, n.x, n.y, n.z);
  }
  return (rbC[key] = g);
}

// terrain height inside the jar: river bed, banks front and back, the elongated island in the middle
function ground(x, z) {
  const az = Math.abs(z);
  const wob = 0.12 * Math.sin(x * 0.9 + z * 0.3) + 0.06 * Math.sin(x * 2.3 - z * 1.7) + 0.04 * Math.sin(x * 4.1 + z * 3.3);
  const bank = smooth((az - 3.15 - 0.25 * Math.sin(x * 0.7 + (z > 0 ? 0 : 2))) / 1.3);
  let y = 2.45 + bank * (1.35 + wob) + (1 - bank) * 0.05 * Math.sin(x * 1.3);
  const e = Math.pow(x / 5.05, 2) + Math.pow(z / (1.06 + 0.08 * Math.sin(x * 0.8)), 2);
  const isl = smooth((1.0 - e) / 0.42);
  y = Math.max(y, 2.45 + isl * (0.92 + 0.6 * wob) - (1 - isl) * 0.2);
  return y;
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x8a5a36, exp: 1.0, bloom: [0.2, 0.5, 0.92], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  bp.threshold = 0.95; bp.strength = 0.18; bp.radius = 0.5;
  scene.background = null;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  // crisp tall softboxes only for the glass, so the jar walls carry vertical highlight streaks
  const glassEnv = (() => {
    const s = new THREE.Scene(); s.background = new THREE.Color(0x2a1d14);
    const strips = [[3, 30, 0xfff4e0, 6, -18, 4, 12], [2, 30, 0xffe2c0, 4, 20, 6, 6], [30, 2, 0xffffff, 3, 0, 22, 0], [6, 20, 0xffd7a8, 2, 0, 4, -22], [2, 24, 0xfff0d8, 3.5, 8, 2, 20]];
    for (const [w, h, c, i, x, y, z] of strips) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    return pm.fromScene(s, 0.02).texture;
  })();

  // ---------- sky dome (morning amber to dusk), fog matches the horizon ----------
  const skyU = { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, h)) : mix(mid, bot, smoothstep(0.0, 0.35, -h)); gl_FragColor = vec4(c, 1.0); }",
  }));
  sky.renderOrder = -10; scene.add(sky);
  scene.fog = new THREE.FogExp2(0x9a6a44, 0.0055);
  const SKY = {
    am: [new THREE.Color("#E3B27E"), new THREE.Color("#B27B4C"), new THREE.Color("#4A2E1C")],
    pm: [new THREE.Color("#7E5A78"), new THREE.Color("#B8704A"), new THREE.Color("#2E1C16")],
  };

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xffe9cc, 0x3a2716, 0.75); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffdcae, 2.6);
  key.position.set(-26, 46, 30); key.target.position.set(0, 3, 0); key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 10, far: 110 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xfff0d8, 1.3); rim.position.set(18, 24, -34); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb7c8e8, 0.35); fill.position.set(30, 12, 24); scene.add(fill);
  const tintL = new THREE.PointLight(0xffffff, 0, 15, 1.1); tintL.position.set(-4.2, 8.6, 2.4); scene.add(tintL);
  const tintR = new THREE.PointLight(0xffffff, 0, 15, 1.1); tintR.position.set(4.2, 8.6, 2.4); scene.add(tintR);
  const spot = new THREE.PointLight(0xfff0c8, 0, 6, 1.4); scene.add(spot);
  const ffL = new THREE.PointLight(0xffd27a, 0, 12, 1.3); ffL.position.set(0, 6, 1); scene.add(ffL);

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const mc = {};
  const once = (k, f) => mc[k] || (mc[k] = f());
  const mk = (geo, mat, x = 0, y = 0, z = 0, p = scene, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const grp = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const SPH = (rr, s = 20) => once("sph" + rr + s, () => new THREE.SphereGeometry(rr, s, Math.round(s * 0.7)));
  const CYL = (a, b, h, s = 20) => once("cyl" + [a, b, h, s], () => new THREE.CylinderGeometry(a, b, h, s));
  const gy = (x, z) => Math.max(ground(x, z), WATER);

  const grainT = canvasTex(256, 256, (g, w, h) => { const q = mulberry(21); const im = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = 110 + q() * 50; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); }, [3, 3]);
  grainT.colorSpace = THREE.NoColorSpace;
  const weaveT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#EDEDED"; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { g.fillStyle = i % 8 ? "rgba(0,0,0,.07)" : "rgba(255,255,255,.5)"; g.fillRect(i, 0, 2, h); g.fillStyle = i % 8 ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.08)"; g.fillRect(0, i, w, 2); } }, [3, 3]);
  const woodT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#4A2C18"; g.fillRect(0, 0, w, h);
    const q = mulberry(17);
    for (let i = 0; i < 560; i++) {
      const y = q() * h, a = 0.05 + q() * 0.16, c = q() < 0.55 ? `rgba(22,11,5,${a})` : `rgba(140,86,46,${a})`;
      g.strokeStyle = c; g.lineWidth = 0.6 + q() * 2.6; g.beginPath();
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 9 + Math.sin(x * 0.021 + i * 0.3) * 2.5);
      g.stroke();
    }
  }, [4, 4]);
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.7)"); gr.addColorStop(0.5, "rgba(0,0,0,.32)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  // contact darkening (AO stand-in). Outside the jar only: transparent objects do not show through transmission.
  const blob = (x, y, z, sx, sz, o = 0.6) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, y, z); m.renderOrder = 2; scene.add(m); return m; };

  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, envMapIntensity: ENV, ...o });
  const fabric = (c) => once("f" + c, () => std({ color: c, roughness: 0.9, map: weaveT, bumpMap: weaveT, bumpScale: 0.8 }));
  const plastic = (c, ro = 0.55) => once("p" + c + ro, () => std({ color: c, roughness: ro, bumpMap: grainT, bumpScale: 0.3 }));
  const clay = (c) => once("c" + c, () => std({ color: c, roughness: 0.85, bumpMap: grainT, bumpScale: 1.2 }));
  const skinM = (c) => once("s" + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffd2c0"), sheenRoughness: 0.5, bumpMap: grainT, bumpScale: 0.2, envMapIntensity: ENV }));
  const gloss = new THREE.MeshPhysicalMaterial({ color: "#16121A", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4 });
  const glint = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const brass = std({ color: "#C9A04A", metalness: 0.9, roughness: 0.28, envMapIntensity: 1.25 });
  const brassDark = std({ color: "#8E6A2C", metalness: 0.85, roughness: 0.4, envMapIntensity: 1.0 });
  const walnut = std({ map: woodT, roughness: 0.45, bumpMap: woodT, bumpScale: 0.5, envMapIntensity: 0.7 });
  const stoneT = canvasTex(256, 256, (g, w, h) => { const q = mulberry(9); g.fillStyle = "#B9B2A3"; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = q() < 0.5 ? `rgba(70,64,56,${q() * 0.25})` : `rgba(255,252,240,${q() * 0.25})`; const s = 1 + q() * 3; g.fillRect(q() * w, q() * h, s, s); } for (let i = 0; i < 14; i++) { g.strokeStyle = "rgba(80,90,60,.25)"; g.lineWidth = 2 + q() * 5; g.beginPath(); g.moveTo(q() * w, h); g.lineTo(q() * w, h - q() * 80); g.stroke(); } });
  const stone = std({ color: "#CFC8B8", map: stoneT, roughness: 0.82, bumpMap: stoneT, bumpScale: 1.2 });

  // ---------- desk and plinth ----------
  const desk = mk(new THREE.CircleGeometry(300, 64), std({ map: woodT, color: 0xb08a6a, roughness: 0.55, bumpMap: woodT, bumpScale: 0.4, envMapIntensity: 0.35 }), 0, -2.6, 0, scene, false);
  desk.rotation.x = -Math.PI / 2;
  woodT.repeat.set(4, 4);
  const plinth = mk(new THREE.CylinderGeometry(10.95, 11.4, 2.6, 128), walnut, 0, -1.3, 0);
  mk(new THREE.TorusGeometry(10.95, 0.12, 12, 160), brass, 0, 0, 0).rotation.x = Math.PI / 2;
  mk(new THREE.TorusGeometry(11.4, 0.1, 12, 160), brass, 0, -2.55, 0).rotation.x = Math.PI / 2;
  blob(0, -2.58, 0.6, 27, 27, 0.75);
  // AUDIRA brass plate, curved on the plinth front
  const plateT = label(1536, 320, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E9CC7A"); gr.addColorStop(0.5, "#C29A45"); gr.addColorStop(1, "#8E6A2C");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(60,40,10,.75)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.lineWidth = 2; g.strokeRect(28, 28, w - 56, h - 56);
    for (const x of [52, w - 52]) for (const y of [52, h - 52]) { g.fillStyle = "#6E5020"; g.beginPath(); g.arc(x, y, 9, 0, 6.283); g.fill(); }
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 104px ${FR}`; g.fillStyle = "rgba(255,240,200,.7)"; g.fillText("AUDIRA", w / 2 + 3, h * 0.42 + 4);
    g.fillStyle = "#1E1204"; g.fillText("AUDIRA", w / 2, h * 0.42);
    g.font = `600 36px ${MONO}`; g.fillStyle = "#3A2608"; g.fillText("TERRARIUM No. 26 · PULAU PHEASANT", w / 2, h * 0.78);
  });
  const plateM = std({ map: plateT, metalness: 0.55, roughness: 0.4, envMapIntensity: 0.8 });
  const plate = mk(new THREE.CylinderGeometry(11.24, 11.26, 1.7, 48, 1, true, -0.36, 0.72), plateM, 0, -1.25, 0, scene, false);

  // ---------- calendar ring ----------
  const R0 = 8.45, R1 = 10.7;
  const RW = 8192, RH = 256, FX = (RW / (2 * Math.PI * (R0 + R1) / 2)) / (RH / (R1 - R0));
  const ringT = label(RW, RH, (g, w, h) => {
    const mw = w / 12, mid = 122;
    const txt = (s, cx, cy, font, col) => { g.save(); g.translate(cx, cy); g.scale(FX, 1); g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); };
    for (let m = 0; m < 12; m++) {
      const es = m >= 1 && m <= 6, x = m * mw;
      g.fillStyle = es ? "#F6E3B4" : "#DCE4F2"; g.fillRect(x, 0, mw, mid);
      g.fillStyle = "rgba(0,0,0,.05)"; for (let k = 0; k < 60; k++) g.fillRect(x + ((k * 53) % mw), (k * 37) % mid, 3, 3);
      txt(MONTHS[m], x + mw / 2, 60, `700 64px ${MONO}`, es ? "#8A1020" : "#1E3A86");
      g.fillStyle = "rgba(42,33,23,.6)"; for (let d = 0; d < 30; d += 1) g.fillRect(x + 10 + d * (mw - 20) / 30, mid - 14, 3, d % 5 === 0 ? 12 : 6);
      g.fillStyle = INK; g.fillRect(x, 0, 5, mid);
      if (es) { g.fillStyle = ES_R; g.fillRect(x, mid, mw, h - mid); g.fillStyle = ES_Y; g.fillRect(x, mid + 32, mw, 70); }
      else { g.fillStyle = FR_B; g.fillRect(x, mid, mw, h - mid); g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(x, mid + 26, mw, 4); g.fillRect(x, h - 30, mw, 4); }
    }
    g.fillStyle = INK; g.fillRect(0, mid - 3, w, 6);
    g.fillStyle = "#F4E9D0"; g.fillRect(mw * 1 - 8, mid, 16, h - mid); g.fillRect(mw * 7 - 8, mid, 16, h - mid);
    txt("SPANYOL", mw * 2.6, mid + 68, `700 60px ${FR}`, "#8A1020"); txt("1 FEB – 31 JUL", mw * 5.0, mid + 68, `700 54px ${FR}`, "#8A1020");
    txt("PRANCIS", mw * 8.5, mid + 68, `700 60px ${FR}`, "#FFFFFF"); txt("1 AGU – 31 JAN", mw * 10.8, mid + 68, `700 54px ${FR}`, "#FFFFFF");
  });
  ringT.anisotropy = 16;
  const ringGeo = new THREE.RingGeometry(R0, R1, 240, 2);
  ringGeo.rotateX(-Math.PI / 2);
  { const p = ringGeo.attributes.position, uv = ringGeo.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let u = Math.atan2(x, z) / (2 * Math.PI); if (u < 0) u += 1; const rr = Math.hypot(x, z); uv.setXY(i, u, 1 - (rr - R0) / (R1 - R0)); } }
  // fix the seam: duplicate-u wrap handled by splitting at u~0 via per-face check
  { const idx = ringGeo.index, uv = ringGeo.attributes.uv; const nu = [], np = [], nidx = []; const p = ringGeo.attributes.position;
    const arr = idx.array; const pos = [], uvs = [];
    for (let f = 0; f < arr.length; f += 3) { const us = [0, 1, 2].map((k) => uv.getX(arr[f + k])); const wrap = Math.max(...us) - Math.min(...us) > 0.5; for (let k = 0; k < 3; k++) { const i = arr[f + k]; let u = uv.getX(i); if (wrap && u < 0.5) u += 1; pos.push(p.getX(i), p.getY(i), p.getZ(i)); uvs.push(u, uv.getY(i)); } }
    ringGeo.setIndex(null); ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); ringGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); ringGeo.computeVertexNormals(); void nu; void np; void nidx; }
  ringT.wrapS = THREE.RepeatWrapping;
  const ringM = std({ map: ringT, roughness: 0.6, emissive: 0xffffff, emissiveMap: ringT, emissiveIntensity: 0.12, envMapIntensity: 0.4 });
  const ringG = grp(0, 0.03, 0);
  mk(ringGeo, ringM, 0, 0.06, 0, ringG, false);
  mk(new THREE.CylinderGeometry(R1 + 0.06, R1 + 0.06, 0.16, 200, 1, true), brassDark, 0, 0.0, 0, ringG, false);
  // brass month studs on the ring edge
  for (let m = 0; m < 12; m++) { const a = m / 12 * 2 * Math.PI; mk(SPH(0.11, 12), brass, Math.sin(a) * (R1 - 0.12), 0.1, Math.cos(a) * (R1 - 0.12), ringG, false); }
  // fixed pointer window at the front: brass bracket + HARI INI tab
  const ptr = grp(0, 0, 0);
  const brk = (a) => { const m = mk(rb(0.16, 0.22, R1 - R0 + 0.5, 0.05), brass, Math.sin(a) * (R0 + R1) / 2, 0.2, Math.cos(a) * (R0 + R1) / 2, ptr); m.rotation.y = a; };
  brk(-Math.PI / 12); brk(Math.PI / 12);
  { const arc = new THREE.Mesh(new THREE.TorusGeometry(R1 + 0.18, 0.09, 8, 24, Math.PI / 6), brass); arc.rotation.x = Math.PI / 2; arc.rotation.z = Math.PI / 2 - Math.PI / 12; arc.position.y = 0.22; ptr.add(arc); }
  const ptrTab = mk(new THREE.ConeGeometry(0.3, 0.5, 3), brass, 0, 0.25, R1 - 0.1, ptr); ptrTab.rotation.x = -Math.PI / 2; ptrTab.rotation.y = Math.PI;
  const hariT = label(512, 128, (g, w, h) => { g.fillStyle = "#2A2117"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 18); g.fill(); g.strokeStyle = "#C9A04A"; g.lineWidth = 6; g.stroke(); g.font = `700 64px ${MONO}`; g.fillStyle = "#F3E9D2"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("HARI INI", w / 2, h / 2 + 3); });
  const hari = mk(new THREE.PlaneGeometry(2.4, 0.6), std({ map: hariT, roughness: 0.5 }), 0, 0.62, R1 + 0.25, ptr, false); hari.rotation.x = -0.35;

  // ---------- jar ----------
  const PROFILE = [[0.001, 0.0], [7.7, 0.0], [7.98, 0.12], [8.05, 0.55], [8.05, 14.2], [7.92, 15.3], [7.3, 16.25], [6.45, 16.85], [6.15, 17.15], [6.12, 17.75], [6.32, 17.95], [6.36, 18.2], [6.18, 18.35]].map(([x, y]) => new THREE.Vector2(x, y));
  const jarGeo = new THREE.LatheGeometry(PROFILE, 160);
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, ior: 1.5, roughness: 0.035, thickness: 0.45, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMap: glassEnv, envMapIntensity: 1.35, specularIntensity: 1, attenuationColor: new THREE.Color("#E6F2E8"), attenuationDistance: 14, side: THREE.DoubleSide });
  const jar = mk(jarGeo, glassM, 0, 0, 0, scene, false); jar.receiveShadow = false; jar.renderOrder = 5;
  // fresnel rim: additive edges so the jar reads as glass even against busy moss
  const rimM = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    uniforms: { c: { value: new THREE.Color("#FFF1D6") }, k: { value: 0.75 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 c; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); f = pow(f, 3.2); gl_FragColor = vec4(c * f * k, 1.0); }",
  });
  const jarRim = new THREE.Mesh(jarGeo, rimM); jarRim.scale.setScalar(1.003); jarRim.renderOrder = 6; scene.add(jarRim);
  // thick lip + base ring catch light
  const lipM = new THREE.MeshPhysicalMaterial({ color: 0xe8f2ea, roughness: 0.05, transmission: 0.6, thickness: 1.2, ior: 1.5, envMap: glassEnv, envMapIntensity: 1.6, clearcoat: 1 });
  mk(new THREE.TorusGeometry(6.3, 0.16, 14, 120), lipM, 0, 18.1, 0, scene, false).rotation.x = Math.PI / 2;
  mk(new THREE.TorusGeometry(7.98, 0.14, 14, 160), lipM, 0, 0.22, 0, scene, false).rotation.x = Math.PI / 2;
  // cork lid with a kraft tag
  const corkT = canvasTex(512, 256, (g, w, h) => { const q = mulberry(4); g.fillStyle = "#B88A55"; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { g.fillStyle = q() < 0.5 ? `rgba(90,55,25,${q() * 0.5})` : `rgba(235,200,150,${q() * 0.4})`; const s = 1 + q() * 3; g.fillRect(q() * w, q() * h, s, s); } });
  const cork = std({ map: corkT, roughness: 0.92, bumpMap: corkT, bumpScale: 2.0 });
  const lid = grp(0, 0, 0);
  mk(new THREE.CylinderGeometry(6.05, 5.8, 1.8, 64), cork, 0, 18.15, 0, lid);
  mk(new THREE.CylinderGeometry(6.5, 6.45, 0.7, 64), cork, 0, 19.3, 0, lid);
  mk(new THREE.TorusGeometry(6.48, 0.07, 8, 96), std({ color: "#7A5A3A", roughness: 0.9 }), 0, 19.05, 0, lid).rotation.x = Math.PI / 2;

  // condensation beads on the inner wall (opaque, glossy)
  {
    const q = mulberry(77), n = 300;
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xdfeee8, roughness: 0.03, clearcoat: 1, envMap: glassEnv, envMapIntensity: 2.2, transparent: false }), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const a = q() * Math.PI * 2, y = 11 + Math.pow(q(), 0.7) * 4.6, s = 0.022 + Math.pow(q(), 4) * 0.07;
      const rr = 7.99 - (y > 15 ? (y - 15) * 0.35 : 0);
      o.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr); o.rotation.set(0, a, 0); o.scale.set(s, s * (1 + q() * 0.5), s * 0.35); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    scene.add(im);
  }

  // ---------- substrate wall (gravel, charcoal, soil) behind the glass ----------
  const subT = canvasTex(1024, 512, (g, w, h) => {
    const q = mulberry(31);
    const Y = (y) => h - (y / 4.4) * h;
    const bands = [[0, 0.95, "#8C877C"], [0.95, 1.35, "#1E1A18"], [1.35, 4.4, "#4A3020"]];
    for (const [a, b, c] of bands) { g.fillStyle = c; g.fillRect(0, Y(b), w, Y(a) - Y(b)); }
    for (let i = 0; i < 1400; i++) { const x = q() * w, y = Y(q() * 0.95), s = 4 + q() * 13; g.fillStyle = `hsl(${30 + q() * 20},${8 + q() * 12}%,${35 + q() * 35}%)`; g.beginPath(); g.ellipse(x, y, s, s * (0.6 + q() * 0.3), q() * 3, 0, 6.283); g.fill(); g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.3, s * 0.3, s * 0.18, 0, 0, 6.283); g.fill(); }
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "0,0,0" : "80,80,80"},${0.3 + q() * 0.5})`; const s = 2 + q() * 7; g.fillRect(q() * w, Y(0.95 + q() * 0.4), s, s * 0.7); }
    for (let i = 0; i < 4200; i++) { g.fillStyle = q() < 0.6 ? `rgba(25,14,8,${q() * 0.6})` : `rgba(140,96,60,${q() * 0.5})`; const s = 1 + q() * 4; g.fillRect(q() * w, Y(1.35 + q() * 3.05), s, s); }
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(200,170,120,${0.2 + q() * 0.2})`; g.lineWidth = 1 + q() * 2; g.beginPath(); let x = q() * w, y = Y(2.6 + q() * 1.2); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += q() * 30 - 15; y += 6 + q() * 10; g.lineTo(x, y); } g.stroke(); }
  }, [3, 1]);
  {
    const geo = new THREE.CylinderGeometry(RIN, RIN, 1, 240, 1, true);
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), top = p.getY(i) > 0; const y = top ? ground(x, z) - 0.02 : 0.02; p.setY(i, y); uv.setY(i, y / 4.4); }
    geo.computeVertexNormals();
    mk(geo, std({ map: subT, roughness: 0.95, bumpMap: subT, bumpScale: 1.5 }), 0, 0, 0, scene, false);
  }

  // ---------- terrain ----------
  const NS = 220;
  const terr = new THREE.PlaneGeometry(2 * RIN, 2 * RIN, NS, NS); terr.rotateX(-Math.PI / 2);
  {
    const p = terr.attributes.position, col = new Float32Array(p.count * 3), q = mulberry(5);
    const cM = new THREE.Color(MOSS), cM2 = new THREE.Color("#6E9A3E"), cS = new THREE.Color("#5A3A22"), cB = new THREE.Color("#3E3226"), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), z = p.getZ(i); const rr = Math.hypot(x, z);
      if (rr > RIN - 0.01) { x *= (RIN - 0.01) / rr; z *= (RIN - 0.01) / rr; p.setX(i, x); p.setZ(i, z); }
      const y = ground(x, z); p.setY(i, y);
      const top = y > 3.25 ? smooth((y - 3.2) / 0.35) : 0;
      const n = 0.5 + 0.5 * Math.sin(x * 3.1 + Math.sin(z * 2.2) * 2) * Math.sin(z * 2.7 + x * 0.6);
      c.copy(y < WATER ? cB : cS).lerp(cM.clone().lerp(cM2, n), top);
      c.multiplyScalar(0.88 + q() * 0.2);
      col.set([c.r, c.g, c.b], i * 3);
    }
    terr.setAttribute("color", new THREE.BufferAttribute(col, 3));
    terr.computeVertexNormals();
  }
  mk(terr, std({ vertexColors: true, roughness: 0.95, bumpMap: grainT, bumpScale: 2.2, envMapIntensity: 0.3 }), 0, 0, 0, scene, false).receiveShadow = true;

  // ---------- water (opaque so it shows through transmission) ----------
  const waterN = (() => {
    const S = 256, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d"); const im = g.createImageData(S, S);
    const hgt = (x, y) => 0.5 * Math.sin(2 * Math.PI * (x * 3 + y * 1) / S) + 0.35 * Math.sin(2 * Math.PI * (x * -2 + y * 5) / S + 1.3) + 0.25 * Math.sin(2 * Math.PI * (x * 7 - y * 3) / S + 2.1) + 0.15 * Math.sin(2 * Math.PI * (x * 11 + y * 9) / S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = hgt(x + 1, y) - hgt(x - 1, y), dy = hgt(x, y + 1) - hgt(x, y - 1); const nx = -dx * 6, ny = -dy * 6, nz = 1, l = Math.hypot(nx, ny, nz); const i = (y * S + x) * 4; im.data[i] = (nx / l * 0.5 + 0.5) * 255; im.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; im.data[i + 2] = (nz / l * 0.5 + 0.5) * 255; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
  })();
  const waterM = new THREE.MeshPhysicalMaterial({ color: "#5F9DAE", roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, normalMap: waterN, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.0, sheen: 0.3, sheenColor: new THREE.Color("#BFE6EE") });
  const water = mk(new THREE.CircleGeometry(RIN - 0.02, 160), waterM, 0, WATER, 0, scene, false); water.rotation.x = -Math.PI / 2; water.receiveShadow = true;
  // foam beads along the island waterline
  {
    const q = mulberry(41), n = 260, o = new THREE.Object3D();
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), std({ color: "#EAF4F2", roughness: 0.5 }), n);
    for (let i = 0; i < n; i++) {
      const a = q() * Math.PI * 2; let x = Math.cos(a) * 5.2, z = Math.sin(a) * 1.2;
      for (let k = 0; k < 8 && ground(x, z) > WATER; k++) { x *= 1.03; z *= 1.08; }
      o.position.set(x + q() * 0.1, WATER + 0.01, z + q() * 0.1); const s = 0.04 + q() * 0.07; o.scale.set(s * 1.6, s * 0.25, s); o.rotation.y = q() * 3; o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    scene.add(im);
  }

  // ---------- moss cushions, pebbles, ferns, mushrooms ----------
  const mossTex = canvasTex(256, 256, (g, w, h) => { const q = mulberry(12); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 90 + q() * 120; g.fillStyle = `rgb(${v},${v},${v})`; const s = 1 + q() * 2.4; g.fillRect(q() * w, q() * h, s, s); } });
  mossTex.colorSpace = THREE.NoColorSpace;
  const mossM = std({ color: 0xffffff, roughness: 0.97, bumpMap: mossTex, bumpScale: 3.0, envMapIntensity: 0.25 });
  const onLand = (x, z, min = 3.2) => Math.hypot(x, z) < RIN - 0.25 && ground(x, z) > min;
  function scatter(n, seed, test, place) { const q = mulberry(seed); let k = 0, guard = 0; while (k < n && guard++ < n * 60) { const x = (q() * 2 - 1) * RIN, z = (q() * 2 - 1) * RIN; if (test(x, z, q)) { place(x, z, q, k); k++; } } return k; }
  {
    const n = 1500, im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), mossM, n), o = new THREE.Object3D(), c = new THREE.Color();
    const pal = ["#4F7A3A", "#5E8A3A", "#3E6630", "#6E9A3E", "#7FA84A", "#486F34"].map((h) => new THREE.Color(h));
    const cnt = scatter(n, 3, (x, z, q) => onLand(x, z) && (Math.abs(z) > 3.6 || q() < 0.95) && !(Math.abs(z) < 0.5 && x > -2.9 && x < -0.2), (x, z, q, k) => {
      const isl = Math.abs(z) < 2; const s = isl ? 0.14 + q() * 0.2 : 0.18 + q() * 0.32;
      o.position.set(x, ground(x, z) - s * 0.3, z); o.scale.set(s * (1 + q() * 0.4), s * (0.45 + q() * 0.25), s * (1 + q() * 0.4)); o.rotation.set(0, q() * 6, 0); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
      c.copy(pal[Math.floor(q() * pal.length)]).multiplyScalar(0.85 + q() * 0.3); im.setColorAt(k, c);
    });
    im.count = cnt; im.castShadow = true; im.receiveShadow = true; scene.add(im);
  }
  {
    const n = 140, im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), std({ color: 0xffffff, roughness: 0.7, bumpMap: grainT, bumpScale: 1.5 }), n), o = new THREE.Object3D(), c = new THREE.Color();
    const cnt = scatter(n, 8, (x, z) => Math.hypot(x, z) < RIN - 0.3 && Math.abs(ground(x, z) - 3.2) < 0.45, (x, z, q, k) => {
      const s = 0.06 + q() * 0.16; o.position.set(x, ground(x, z) + s * 0.2, z); o.scale.set(s * 1.3, s * 0.7, s); o.rotation.set(q() * 3, q() * 3, q() * 3); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
      c.setHSL(0.08 + q() * 0.05, 0.08 + q() * 0.1, 0.45 + q() * 0.3); im.setColorAt(k, c);
    });
    im.count = cnt; im.castShadow = true; scene.add(im);
  }
  const fernT = canvasTex(256, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = "#3C6A28"; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h); g.quadraticCurveTo(w / 2 + 20, h * 0.5, w / 2 - 10, 10); g.stroke();
    for (let i = 0; i < 22; i++) { const u = i / 22, y = h - 30 - u * (h - 50), x = w / 2 + 20 * Math.sin(u * 2) - 10 * u, L = (1 - u * 0.85) * 110; for (const s of [-1, 1]) { g.fillStyle = `hsl(${95 + (i % 3) * 6},${45 + (i % 2) * 10}%,${30 + u * 14}%)`; g.beginPath(); g.ellipse(x + s * L * 0.5, y - 6, L * 0.5, 9 + (1 - u) * 6, s * -0.35, 0, 6.283); g.fill(); } }
  });
  const fernM = std({ map: fernT, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 });
  const ferns = [];
  {
    const n = 46, geo = new THREE.PlaneGeometry(1, 2); geo.translate(0, 1, 0);
    const im = new THREE.InstancedMesh(geo, fernM, n * 2);
    const cnt = scatter(n, 19, (x, z) => onLand(x, z, 3.5) && Math.abs(z) > 3.7 && !(z > 0 && Math.abs(x) < 5.6) && !(z > 4 && x < -2.2 && x > -6.6) && !(z < -4 && x > 1.6 && x < 6.4), (x, z, q, k) => { ferns.push({ x, y: ground(x, z) - 0.05, z, s: 0.5 + q() * 0.7, a: q() * 6, ph: q() * 6 }); });
    im.count = cnt * 2; im.castShadow = true; scene.add(im);
    ferns.im = im;
  }
  const fernO = new THREE.Object3D();
  const placeFerns = (t) => { ferns.forEach((f, i) => { for (let k = 0; k < 2; k++) { fernO.position.set(f.x, f.y, f.z); fernO.rotation.set(0.25 * Math.sin(f.a + k * 1.6), f.a + k * Math.PI / 2, 0.22 + 0.035 * Math.sin(t * 0.8 + f.ph)); fernO.scale.setScalar(f.s); fernO.updateMatrix(); ferns.im.setMatrixAt(i * 2 + k, fernO.matrix); } }); ferns.im.instanceMatrix.needsUpdate = true; };
  placeFerns(0);
  // tiny mushrooms on the banks, caps glow at dusk
  const capM = std({ color: "#F0E2C4", roughness: 0.6, emissive: new THREE.Color("#B8FF9A"), emissiveIntensity: 0 });
  for (const [x, z] of [[-6.4, 3.9], [-5.9, 4.4], [6.2, -3.9], [5.8, -4.6], [6.6, 3.7], [-1.2, -5.9], [1.4, 6.1]]) {
    const y = ground(x, z);
    mk(CYL(0.035, 0.05, 0.28, 8), std({ color: "#EFE6D2", roughness: 0.7 }), x, y + 0.12, z);
    const cp = mk(SPH(0.14, 14), capM, x, y + 0.27, z); cp.scale.set(1, 0.55, 1);
  }

  // ---------- trees on the island and banks ----------
  const leafT = canvasTex(128, 128, (g, w, h) => { const q = mulberry(6); g.fillStyle = "#888"; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { const v = 80 + q() * 140; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(q() * w, q() * h, 1 + q() * 2.5, 0, 6.283); g.fill(); } });
  leafT.colorSpace = THREE.NoColorSpace;
  const leafM = (c) => once("l" + c, () => std({ color: c, roughness: 0.85, bumpMap: leafT, bumpScale: 2.5, envMapIntensity: 0.3 }));
  const barkM = std({ color: "#6B5440", roughness: 0.9, bumpMap: grainT, bumpScale: 2 });
  const trees = [];
  function tree(x, z, h, seed, col = "#3F6A2E") {
    const q = mulberry(seed), T = grp(x, ground(x, z) - 0.05, z);
    mk(CYL(0.06 * h, 0.1 * h, h * 0.62, 10), barkM, 0, h * 0.31, 0, T);
    for (let i = 0; i < 9; i++) { const rr = h * (0.2 + q() * 0.12); mk(new THREE.IcosahedronGeometry(rr, 1), leafM(i % 3 ? col : "#5A8A3A"), (q() - 0.5) * h * 0.42, h * (0.62 + q() * 0.42), (q() - 0.5) * h * 0.3, T); }
    trees.push(T); return T;
  }
  tree(-4.25, 0.12, 2.0, 1); tree(-3.6, -0.35, 1.5, 2, "#4C7A34"); tree(4.55, -0.1, 1.9, 3); tree(-5.4, -4.6, 2.3, 4, "#355E2A"); tree(4.3, 5.6, 1.6, 5, "#4C7A34"); tree(-2.2, -6.4, 2.0, 6);

  // ---------- name cards (opaque, billboarded) ----------
  const cards = [];
  function paintCard(g, w, h, title, sub, band) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.roundRect(10, 16, w - 16, h - 20, 22); g.fill();
    g.fillStyle = PAPER; g.beginPath(); g.roundRect(4, 4, w - 16, h - 20, 22); g.fill();
    g.strokeStyle = "#8E6A2C"; g.lineWidth = 5; g.stroke();
    const bw = 34;
    g.save(); g.beginPath(); g.roundRect(4, 4, w - 16, h - 20, 22); g.clip();
    if (band === "ES") { g.fillStyle = ES_R; g.fillRect(4, 4, bw, h); g.fillStyle = ES_Y; g.fillRect(4, 4 + (h - 20) * 0.25, bw, (h - 20) * 0.5); }
    else if (band === "FR") { g.fillStyle = FR_B; g.fillRect(4, 4, bw, (h - 20) / 3 + 1); g.fillStyle = "#fff"; g.fillRect(4, 4 + (h - 20) / 3, bw, (h - 20) / 3 + 1); g.fillStyle = FR_R; g.fillRect(4, 4 + 2 * (h - 20) / 3, bw, (h - 20) / 3 + 2); }
    else if (band === "BOTH") { g.fillStyle = ES_R; g.fillRect(4, 4, bw, (h - 20) / 2); g.fillStyle = FR_B; g.fillRect(4, 4 + (h - 20) / 2, bw, (h - 20) / 2 + 2); }
    else { g.fillStyle = "#4F7A3A"; g.fillRect(4, 4, bw, h); }
    g.restore();
    const cx = (w - 12 + bw) / 2;
    let fs = sub ? 74 : 92; g.font = `700 ${fs}px ${FR}`; while (g.measureText(title).width > w - bw - 70 && fs > 30) { fs -= 2; g.font = `700 ${fs}px ${FR}`; }
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(title, cx, sub ? (h - 20) * 0.4 + 4 : (h - 20) / 2 + 6);
    if (sub) { let s2 = 34; g.font = `600 ${s2}px ${MONO}`; while (g.measureText(sub).width > w - bw - 70 && s2 > 18) { s2 -= 1; g.font = `600 ${s2}px ${MONO}`; } g.fillStyle = band === "ES" ? "#8A1020" : band === "FR" ? "#1E3A86" : "#3E5A2A"; g.fillText(sub, cx, (h - 20) * 0.78 + 2); }
  }
  function card(title, sub, band, w = 1.9, opt = {}) {
    const pw = 768, ph = Math.round(pw * (opt.h || 0.62) / w) + 20;
    const tx = label(pw, ph, (g, W, H) => paintCard(g, W, H, title, sub, band));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * ph / pw), new THREE.MeshBasicMaterial({ map: tx, alphaTest: 0.5, color: 0xe2ddd2, side: THREE.DoubleSide, fog: false }));
    m.castShadow = false; scene.add(m); m.visible = false;
    const c = { m, at: opt.at ?? 0, out: opt.out ?? 1e9, pos: opt.pos || new V3(), follow: opt.follow || null, dy: opt.dy ?? 0 };
    cards.push(c); return c;
  }

  // ---------- flags ----------
  const flagTex = {
    S: canvasTex(384, 256, (g, w, h) => { g.fillStyle = ES_R; g.fillRect(0, 0, w, h); g.fillStyle = ES_Y; g.fillRect(0, h / 4, w, h / 2); }),
    F: canvasTex(384, 256, (g, w, h) => { g.fillStyle = FR_B; g.fillRect(0, 0, w / 3, h); g.fillStyle = "#fff"; g.fillRect(w / 3, 0, w / 3, h); g.fillStyle = FR_R; g.fillRect(2 * w / 3, 0, w / 3 + 1, h); }),
    X: canvasTex(384, 256, (g, w, h) => {
      g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(0, h); g.closePath(); g.clip(); g.fillStyle = ES_R; g.fillRect(0, 0, w, h); g.fillStyle = ES_Y; g.fillRect(0, h / 4, w, h / 2); g.restore();
      g.save(); g.beginPath(); g.moveTo(w, 0); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.clip(); g.fillStyle = FR_B; g.fillRect(0, 0, w / 3, h); g.fillStyle = "#fff"; g.fillRect(w / 3, 0, w / 3, h); g.fillStyle = FR_R; g.fillRect(2 * w / 3, 0, w / 3 + 1, h); g.restore();
      g.strokeStyle = "#F4E9D0"; g.lineWidth = 10; g.beginPath(); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    }),
  };
  const flags = [];
  function flag(x, z, poleH, fw, fh, tex, p = scene) {
    const G = grp(x, gy(x, z) - 0.05, z, p);
    mk(CYL(0.05, 0.07, poleH, 12), std({ color: "#E8E0CC", roughness: 0.4, metalness: 0.2 }), 0, poleH / 2, 0, G);
    mk(SPH(0.11, 14), brass, 0, poleH + 0.08, 0, G);
    mk(CYL(0.14, 0.2, 0.18, 14), stone, 0, 0.09, 0, G);
    const F = grp(0, poleH - fh / 2 - 0.06, 0, G);
    const geo = new THREE.PlaneGeometry(fw, fh, 18, 6); geo.translate(fw / 2, 0, 0);
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, side: THREE.DoubleSide, envMapIntensity: ENV });
    const m = mk(geo, mat, 0.06, 0, 0, F);
    const f = { G, F, geo, base: Float32Array.from(geo.attributes.position.array), w: fw, m, ph: x * 1.7 + z };
    flags.push(f); return f;
  }
  const mainFlag = flag(3.7, 0.05, 4.3, 2.1, 1.4, flagTex.F);
  const bankES = flag(5.3, 4.7, 2.0, 0.95, 0.63, flagTex.S);
  const bankFR = flag(-5.0, -4.9, 2.2, 0.95, 0.63, flagTex.F);
  bankES.G.rotation.y = 0.5; bankFR.G.rotation.y = -0.3;

  // ---------- monolith (1659) ----------
  const MX = 0.75;
  const mono = grp(MX, gy(MX, 0) - 0.04, 0);
  mk(rb(0.95, 0.24, 0.95, 0.06), stone, 0, 0.12, 0, mono);
  mk(rb(0.72, 0.2, 0.72, 0.05), stone, 0, 0.34, 0, mono);
  const shaft = mk(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 4, 1), stone, 0, 1.19, 0, mono); shaft.rotation.y = Math.PI / 4;
  mk(new THREE.ConeGeometry(0.21, 0.3, 4), stone, 0, 2.09, 0, mono).rotation.y = Math.PI / 4;
  const monoPlT = label(256, 160, (g, w, h) => { g.fillStyle = "#C9A04A"; g.fillRect(0, 0, w, h); g.strokeStyle = "#5A3E10"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.font = `700 86px ${FR}`; g.fillStyle = "#3A2608"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1659", w / 2, h / 2 + 6); });
  const monoPl = mk(new THREE.PlaneGeometry(0.42, 0.26), std({ map: monoPlT, metalness: 0.7, roughness: 0.3, envMapIntensity: 1.2 }), 0, 0.92, 0.2, mono, false); monoPl.rotation.x = -0.065;

  // ---------- conference table (1659) ----------
  const TX = -1.55, TY = gy(TX, 0);
  const table = grp(TX, TY, 0);
  const cloth = fabric("#6E1E2A");
  mk(rb(1.5, 0.08, 0.8, 0.03), std({ map: woodT, color: 0x9a6a46, roughness: 0.5 }), 0, 0.5, 0, table);
  mk(rb(1.54, 0.3, 0.84, 0.03), cloth, 0, 0.36, 0, table);
  for (const [x, z] of [[-0.66, -0.32], [0.66, -0.32], [-0.66, 0.32], [0.66, 0.32]]) mk(CYL(0.035, 0.035, 0.46, 8), walnut, x, 0.23, z, table);
  const chairs = [].map((s) => { const C = grp(s * 1.05, 0, 0, table); mk(rb(0.34, 0.06, 0.34, 0.02), walnut, 0, 0.3, 0, C); mk(rb(0.06, 0.5, 0.34, 0.02), walnut, s * 0.16, 0.55, 0, C); for (const [x, z] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) mk(CYL(0.02, 0.02, 0.3, 6), walnut, x, 0.15, z, C); return C; });
  // stack of 24 meeting papers grows on "dua puluh empat"; the treaty unrolls on "Perjanjian"
  const paperM = std({ color: "#F1E6CC", roughness: 0.85 });
  const sheets = []; for (let i = 0; i < 24; i++) { const m = mk(rb(0.34, 0.012, 0.25, 0.004, 1), paperM, -0.35 + (i % 2) * 0.01, 0.55 + i * 0.016, -0.05 + (i % 3) * 0.008, table); m.rotation.y = (i * 0.37) % 0.3 - 0.15; m.visible = false; sheets.push(m); }
  const treatyT = label(512, 384, (g, w, h) => { g.fillStyle = "#F4E7C8"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(120,80,30,.12)"; for (let i = 0; i < 400; i++) g.fillRect((i * 97) % w, (i * 61) % h, 3, 2); g.font = `700 50px ${FR}`; g.fillStyle = INK; g.textAlign = "center"; g.fillText("PERJANJIAN", w / 2, 78); g.fillText("PYRENEES", w / 2, 134); g.font = `600 40px ${MONO}`; g.fillText("1659", w / 2, 190); g.strokeStyle = "rgba(42,33,23,.45)"; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(70, 230 + i * 28); g.lineTo(w - 70, 230 + i * 28); g.stroke(); } g.fillStyle = "#9A1B22"; g.beginPath(); g.arc(w * 0.3, h - 40, 24, 0, 6.283); g.fill(); g.fillStyle = "#1E3A86"; g.beginPath(); g.arc(w * 0.7, h - 40, 24, 0, 6.283); g.fill(); });
  const treaty = mk(new THREE.PlaneGeometry(0.62, 0.46), std({ map: treatyT, roughness: 0.8, emissive: 0xffffff, emissiveMap: treatyT, emissiveIntensity: 0.1 }), 0.25, 0.552, 0.03, table, false);
  treaty.rotation.x = -Math.PI / 2; treaty.visible = false;
  const quill = grp(0.62, 0.56, -0.2, table); mk(CYL(0.008, 0.012, 0.42, 6), std({ color: "#F2EEE6", roughness: 0.6 }), 0, 0.18, 0, quill); quill.rotation.z = -0.5;

  // ---------- toy people ----------
  const SKIN = "#E8B28E";
  const HAND = SPH(0.17, 16), EYE = SPH(0.068, 16), GL = SPH(0.022, 8);
  function person(o) {
    const G = new THREE.Group(); scene.add(G);
    const coat = fabric(o.coat), pants = fabric(o.pants || "#2E2A30"), sk = skinM(o.skin || SKIN), boot = plastic(o.boot || "#2B211C", 0.45);
    const legs = [];
    if (o.dress) {
      const sk2 = mk(new THREE.CylinderGeometry(0.42, o.wide ? 1.05 : 0.72, 1.45, 28), fabric(o.dress), 0, 0.74, 0, G);
      if (o.trim) for (const y of [0.25, 0.7]) mk(new THREE.CylinderGeometry(0.42 + (o.wide ? 0.63 : 0.3) * (1 - (y + 0.02) / 1.45) + 0.012, 0.42 + (o.wide ? 0.63 : 0.3) * (1 - (y - 0.02) / 1.45) + 0.012, 0.07, 28), fabric(o.trim), 0, y, 0, G);
      void sk2;
    } else {
      for (const s of [-1, 1]) {
        const hip = grp(s * 0.2, 1.2, 0, G); mk(rb(0.32, 0.64, 0.36, 0.11), pants, 0, -0.3, 0, hip);
        const knee = grp(0, -0.6, 0, hip); mk(rb(0.29, 0.5, 0.33, 0.1), o.hose ? fabric(o.hose) : pants, 0, -0.23, 0, knee); mk(rb(0.34, 0.2, 0.52, 0.08), boot, 0, -0.5, 0.08, knee);
        legs.push({ hip, knee });
      }
      mk(rb(0.76, 0.38, 0.46, 0.14), pants, 0, 1.24, 0, G);
    }
    const torso = grp(0, 1.4, 0, G);
    mk(rb(1.02, 0.95, 0.58, 0.17), coat, 0, 0.45, 0, torso);
    if (o.robe) mk(new THREE.CylinderGeometry(0.5, 0.78, 1.5, 24), coat, 0, -0.62, 0, torso);
    if (o.cape) mk(rb(1.14, 0.42, 0.66, 0.18), fabric(o.cape), 0, 0.78, 0, torso);
    if (o.vest) mk(rb(1.06, 0.8, 0.62, 0.15), fabric(o.vest), 0, 0.5, 0, torso);
    if (o.stripe) for (const y of [0.28, 0.6]) mk(rb(1.08, 0.07, 0.64, 0.03), fabric(o.stripe), 0, y, 0, torso);
    if (o.buttons) for (let i = 0; i < 3; i++) mk(SPH(0.045, 10), brass, 0, 0.22 + i * 0.2, 0.3, torso);
    if (o.collar) mk(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 24), fabric(o.collar), 0, 0.96, 0, torso);
    if (o.epaul) for (const s of [-1, 1]) mk(rb(0.36, 0.1, 0.38, 0.05), brass, s * 0.56, 0.95, 0, torso);
    if (o.sash) { const c = mk(rb(0.15, 1.15, 0.04, 0.02), fabric(o.sash), 0, 0.46, 0.3, torso); c.rotation.z = 0.62; }
    const head = grp(0, 1.0, 0, torso);
    mk(CYL(0.15, 0.17, 0.2, 12), sk, 0, 0.02, 0, head);
    mk(rb(0.82, 0.76, 0.74, 0.24), sk, 0, 0.46, 0, head);
    const eyes = [-1, 1].map((s) => { const e = mk(EYE, gloss, s * 0.17, 0.52, 0.36, head); const g2 = new THREE.Mesh(GL, glint); g2.position.set(0.022, 0.026, 0.055); e.add(g2); return e; });
    const sm = mk(once("smile", () => new THREE.TorusGeometry(0.085, 0.02, 6, 14, Math.PI)), gloss, 0, 0.34, 0.37, head); sm.rotation.z = Math.PI; sm.castShadow = false;
    mk(SPH(0.055, 12), skinM("#D99A78"), 0, 0.45, 0.385, head);
    if (o.hair) { mk(rb(0.86, 0.22, 0.78, 0.08), clay(o.hair), 0, 0.86, -0.02, head); mk(rb(0.86, 0.5, 0.2, 0.08), clay(o.hair), 0, 0.62, -0.31, head); }
    if (o.wig) { for (const s of [-1, 1]) { const c = mk(rb(0.3, 0.95, 0.5, 0.14), clay(o.wig), s * 0.47, 0.32, -0.05, head); c.rotation.z = s * 0.05; } mk(rb(0.92, 0.3, 0.86, 0.13), clay(o.wig), 0, 0.88, -0.03, head); mk(rb(0.86, 0.8, 0.24, 0.12), clay(o.wig), 0, 0.42, -0.36, head); }
    if (o.long) { mk(rb(0.9, 0.26, 0.84, 0.1), clay(o.long), 0, 0.86, -0.02, head); mk(rb(0.92, 0.9, 0.26, 0.1), clay(o.long), 0, 0.42, -0.34, head); for (const s of [-1, 1]) mk(rb(0.16, 0.55, 0.5, 0.07), clay(o.long), s * 0.44, 0.5, -0.05, head); }
    if (o.beard) { mk(rb(0.36, 0.06, 0.1, 0.03), clay(o.beard), 0, 0.37, 0.4, head); mk(rb(0.14, 0.18, 0.12, 0.05), clay(o.beard), 0, 0.2, 0.36, head); }
    if (o.stache) mk(rb(0.4, 0.07, 0.1, 0.03), clay(o.stache), 0, 0.38, 0.4, head);
    if (o.hat === "zucchetto") mk(new THREE.SphereGeometry(0.3, 18, 8, 0, 6.283, 0, 1.2), fabric("#B3132A"), 0, 0.76, -0.04, head);
    if (o.hat === "crown") { mk(CYL(0.3, 0.28, 0.16, 18), brass, 0, 1.1, 0, head); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; mk(new THREE.ConeGeometry(0.05, 0.14, 6), brass, Math.sin(a) * 0.27, 1.24, Math.cos(a) * 0.27, head); } }
    if (o.hat === "tiara") mk(new THREE.TorusGeometry(0.3, 0.035, 8, 20), brass, 0, 0.96, 0, head).rotation.x = Math.PI / 2 - 0.2;
    if (o.hat === "cap") { mk(CYL(0.42, 0.44, 0.22, 20), fabric(o.capC || "#1E2433"), 0, 0.96, 0, head); mk(rb(0.5, 0.05, 0.26, 0.02), plastic("#141218", 0.3), 0, 0.88, 0.4, head); }
    if (o.hat === "brim") { mk(CYL(0.62, 0.64, 0.05, 26), fabric("#1B1B20"), 0, 0.9, 0, head); mk(CYL(0.36, 0.4, 0.34, 20), fabric("#1B1B20"), 0, 1.08, 0, head); }
    const arms = [-1, 1].map((s) => {
      const sh = grp(s * 0.63, 0.82, 0, torso); mk(rb(0.28, 0.56, 0.32, 0.11), coat, 0, -0.24, 0, sh);
      const el = grp(0, -0.5, 0, sh); mk(rb(0.26, 0.48, 0.29, 0.1), coat, 0, -0.21, 0, el);
      const hand = mk(HAND, o.glove ? plastic("#F4F1EA", 0.6) : sk, 0, -0.5, 0, el);
      sh.rotation.z = s * 0.14; el.rotation.x = -0.4;
      return { sh, el, hand };
    });
    G.scale.setScalar(o.s || 0.33);
    G.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    G.visible = false;
    return { G, torso, head, eyes, arms, legs, ph: o.ph || 0, s: o.s || 0.33 };
  }
  function life(P, t) {
    P.torso.position.y = 1.4 + Math.sin(t * 2.2 + P.ph) * 0.015;
    P.head.rotation.z = Math.sin(t * 0.9 + P.ph) * 0.05;
    const bl = (t * 0.37 + P.ph * 0.13) % 1; const s = bl < 0.03 ? 0.12 : 1;
    for (const e of P.eyes) e.scale.y = s;
  }
  function walk(P, ph, amp) {
    P.legs.forEach((L, i) => { const s = Math.sin(ph + i * Math.PI); L.hip.rotation.x = s * 0.5 * amp; L.knee.rotation.x = Math.max(0, -s) * 0.7 * amp; });
    P.arms.forEach((a, i) => { a.sh.rotation.x = -Math.sin(ph + i * Math.PI) * 0.45 * amp; });
  }
  const haro = person({ coat: "#1F1C24", pants: "#1F1C24", hose: "#2A2630", collar: "#F4EFE4", hair: "#3A2618", stache: "#3A2618", ph: 1 });
  const maza = person({ coat: "#B3132A", cape: "#B3132A", collar: "#F4EFE4", hair: "#6A5442", beard: "#6A5442", hat: "zucchetto", dress: "#B3132A", ph: 2 });
  const louis = person({ coat: "#24408E", pants: "#24408E", hose: "#F2EEE4", buttons: true, sash: "#E9D27A", wig: "#4A2E1A", hat: "crown", ph: 3, s: 0.34 });
  const mt = person({ coat: "#F2E4CC", dress: "#F2E4CC", wide: true, trim: "#B8323A", long: "#D8B46A", hat: "tiara", ph: 4, s: 0.32 });
  const loti = person({ coat: "#1E2A44", pants: "#1E2A44", epaul: true, buttons: true, hat: "cap", capC: "#1E2A44", hair: "#3A2A1E", stache: "#2A1E14", ph: 5 });
  const clean = person({ coat: "#59606A", pants: "#3C4048", vest: "#F26B1D", stripe: "#E8F0F0", hat: "cap", capC: "#F26B1D", hair: "#2A1E14", ph: 6 });
  // broom for the cleaner
  { const B = grp(0, -0.5, 0.05, clean.arms[1].el); mk(CYL(0.04, 0.04, 2.4, 8), walnut, 0, -0.2, 0.0, B); const head = mk(rb(0.6, 0.32, 0.18, 0.06), clay("#C9A25A"), 0, -1.4, 0, B); void head; B.rotation.x = 0.3; }
  const people = [haro, maza, louis, mt, loti, clean];

  const tagHaro = card("LUIS DE HARO", "UTUSAN SPANYOL", "ES", 1.75, { follow: haro, dy: 1.65 });
  const tagMaza = card("KARDINAL MAZARIN", "UTUSAN PRANCIS", "FR", 1.75, { follow: maza, dy: 1.65 });
  const tagLouis = card("LOUIS XIV", "RAJA PRANCIS", "FR", 1.6, { follow: louis, dy: 1.75 });
  const tagMT = card("MARIA THERESA", "PUTRI SPANYOL", "ES", 1.6, { follow: mt, dy: 1.65 });
  const tagLoti = card("PIERRE LOTI", "PENULIS PRANCIS", "FR", 1.6, { follow: loti, dy: 1.7 });
  const tagClean = card("PETUGAS", "TIAP 6 BULAN", "BOTH", 1.35, { follow: clean, dy: 1.65 });

  // ---------- size rulers (s2) ----------
  const rulerM = std({ color: "#D9B45A", metalness: 0.8, roughness: 0.3, envMapIntensity: 1.2, emissive: 0x3a2808, emissiveIntensity: 0.5 });
  const rulerL = grp(0, 4.15, 1.75); { mk(rb(10.1, 0.06, 0.06, 0.02), rulerM, 0, 0, 0, rulerL, false); for (const s of [-1, 1]) mk(rb(0.06, 0.4, 0.06, 0.02), rulerM, s * 5.05, 0, 0, rulerL, false); for (let i = -5; i <= 5; i++) mk(rb(0.03, 0.16, 0.03, 0.01), rulerM, i, -0.08, 0, rulerL, false); }
  const rulerW = grp(5.75, 4.15, 0); { mk(rb(0.06, 0.06, 2.15, 0.02), rulerM, 0, 0, 0, rulerW, false); for (const s of [-1, 1]) mk(rb(0.06, 0.4, 0.06, 0.02), rulerM, 0, 0, s * 1.075, rulerW, false); }
  const tag200 = card("± 200 m", "PANJANG", "", 1.55, { pos: new V3(-1.2, 4.75, 1.85) });
  const tag40 = card("± 40 m", "LEBAR", "", 1.3, { pos: new V3(6.1, 4.85, 0.6) });
  // river and bank tags on stakes
  const tagRiver = card("SUNGAI BIDASOA", "", "", 2.3, { pos: new V3(-4.3, 4.2, 2.45), h: 0.5 });
  const tagES = card("SPANYOL", "", "ES", 1.7, { pos: new V3(3.3, 4.85, 5.0), h: 0.5 });
  const tagFR = card("PRANCIS", "", "FR", 1.7, { pos: new V3(-3.0, 5.0, -5.2), h: 0.5 });
  const tagIsl = card("PULAU PHEASANT", "TIDAK BERPENGHUNI", "BOTH", 2.2, { pos: new V3(-1.3, 5.4, 0.4) });
  const tagMono = card("MONUMEN 1659", "PERJANJIAN PYRENEES", "BOTH", 1.75, { pos: new V3(MX, 6.45, 0.25) });

  // ---------- towns: Irun (front bank, Spain) and Hendaye (back bank, France) ----------
  const winM = std({ color: "#3A3430", roughness: 0.4, emissive: new THREE.Color("#FFC870"), emissiveIntensity: 0 });
  const towns = { irun: [], hend: [] };
  function house(x, z, w, h, d, roof, wall, trim, list) {
    const y = ground(x, z) - 0.04, H = grp(x, y, z); H.rotation.y = Math.atan2(x, z) + Math.PI + (list === towns.irun ? 0 : 0);
    mk(rb(w, h, d, 0.04), plastic(wall, 0.7), 0, h / 2, 0, H);
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, d * 0.72, w * 1.08, 3, 1), clay(roof)); rf.rotation.z = Math.PI / 2; rf.rotation.y = 0; rf.scale.set(1, 1, 0.55); rf.position.set(0, h + d * 0.18, 0); rf.castShadow = true; H.add(rf);
    for (const s of [-1, 1]) { mk(rb(0.12, 0.16, 0.02, 0.01), winM, s * w * 0.25, h * 0.6, d / 2 + 0.005, H, false); mk(rb(0.04, 0.18, 0.02, 0.01), plastic(trim, 0.6), s * w * 0.25 - 0.09, h * 0.6, d / 2 + 0.01, H, false); }
    for (const s of [-1, 1]) mk(rb(0.12, 0.16, 0.02, 0.01), winM, s * w * 0.25, h * 0.6, -d / 2 - 0.005, H, false);
    list.push(H); return H;
  }
  { const q = mulberry(11); for (let i = 0; i < 9; i++) { const a = -0.25 - i * 0.065 + q() * 0.02, rr = 6.0 + (i % 3) * 0.55; house(Math.sin(a) * rr, Math.cos(a) * rr, 0.5 + q() * 0.2, 0.42 + q() * 0.3, 0.42, "#B5502E", "#F2EDE2", i % 2 ? "#8E1B22" : "#2F6A3A", towns.irun); } }
  { const q = mulberry(12); for (let i = 0; i < 9; i++) { const a = 0.25 + i * 0.065 + q() * 0.02, rr = 6.0 + (i % 3) * 0.55; house(Math.sin(a) * rr, -Math.cos(a) * rr, 0.5 + q() * 0.2, 0.42 + q() * 0.3, 0.42, "#5C6A7E", "#F2EDE2", i % 2 ? "#2B4BA0" : "#8E1B22", towns.hend); } }
  const tagIrun = card("IRUN", "SPANYOL", "ES", 1.5, { pos: new V3(-3.6, 5.5, 5.6) });
  const tagHend = card("HENDAYE", "PRANCIS", "FR", 1.6, { pos: new V3(3.6, 5.7, -5.8) });

  // ---------- viceroy badge (s6) ----------
  const badge = grp(0, 7.2, 1.6);
  const badgeT = label(512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(w * 0.4, h * 0.35, 20, w / 2, h / 2, w / 2); gr.addColorStop(0, "#F6DE94"); gr.addColorStop(0.6, "#C9A04A"); gr.addColorStop(1, "#8E6A2C");
    g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 6.283); g.fill();
    g.strokeStyle = "#5A3E10"; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 22, 0, 6.283); g.stroke();
    g.fillStyle = FR_B; g.beginPath(); g.arc(w / 2, h / 2, 132, 0, 6.283); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(w / 2, h / 2, 132, 0, 6.283); g.save(); g.clip(); g.fillRect(w / 2 - 44, 0, 88, h); g.fillStyle = FR_R; g.fillRect(w / 2 + 44, 0, 100, h); g.restore();
    g.strokeStyle = "#5A3E10"; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 132, 0, 6.283); g.stroke();
    const arcText = (txt, rad, top) => { g.font = `700 44px ${FR}`; g.fillStyle = "#3A2608"; g.textAlign = "center"; g.textBaseline = "middle"; const tot = g.measureText(txt).width / rad; let a = (top ? -Math.PI / 2 : Math.PI / 2) - (top ? tot / 2 : -tot / 2); for (const ch of txt) { const cw = g.measureText(ch).width / rad; a += (top ? 1 : -1) * cw / 2; g.save(); g.translate(w / 2 + Math.cos(a) * rad, h / 2 + Math.sin(a) * rad); g.rotate(a + (top ? Math.PI / 2 : -Math.PI / 2)); g.fillText(ch, 0, 0); g.restore(); a += (top ? 1 : -1) * cw / 2; } };
    arcText("RAJA MUDA", 190, true); arcText("PULAU PHEASANT", 190, false);
    for (const s of [-1, 1]) { g.fillStyle = "#5A3E10"; g.beginPath(); g.arc(w / 2 + s * 190, h / 2, 9, 0, 6.283); g.fill(); }
  });
  { const disc = mk(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 64), [brass, std({ map: badgeT, metalness: 0.8, roughness: 0.3, envMapIntensity: 1.2 }), brass], 0, 0, 0, badge, false); disc.rotation.x = Math.PI / 2; disc.rotation.y = 0;
    mk(new THREE.TorusGeometry(1.12, 0.07, 12, 80), brass, 0, 0, 0, badge, false);
    const rib = grp(0, 1.15, -0.05, badge); for (let i = 0; i < 3; i++) mk(rb(0.26, 0.9, 0.03, 0.01), fabric([FR_B, "#F4F4F4", FR_R][i]), -0.26 + i * 0.26, 0.4, 0, rib, false); }
  badge.visible = false;
  // a CylinderGeometry cap maps uv from above; rotate disc so its +y cap faces the camera
  // ---------- no-entry sign, patrol boat, pheasant (s7) ----------
  const NE = grp(-2.7, gy(-2.7, 0.72) - 0.05, 0.72);
  mk(CYL(0.035, 0.035, 1.2, 8), std({ color: "#D8D4CC", roughness: 0.4, metalness: 0.4 }), 0, 0.6, 0, NE);
  const neT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#C8102E"; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, 6.283); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 14, 0, 6.283); g.stroke(); g.fillStyle = "#fff"; g.fillRect(w * 0.2, h * 0.43, w * 0.6, h * 0.14); });
  const neDisc = mk(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 40), [std({ color: "#AFAAA2", metalness: 0.5, roughness: 0.4 }), std({ map: neT, roughness: 0.45, emissive: 0xffffff, emissiveMap: neT, emissiveIntensity: 0.15 }), std({ color: "#AFAAA2", metalness: 0.5 })], 0, 1.35, 0, NE);
  neDisc.rotation.x = Math.PI / 2;
  const tagNE = card("DILARANG MASUK", "", "BOTH", 1.6, { follow: NE, dy: 2.1, h: 0.5, out: A("s7:petugas") });
  NE.visible = false;
  const boat = grp(0, WATER, 0);
  {
    const hullS = new THREE.Shape(); hullS.moveTo(-0.75, -0.26); hullS.lineTo(0.45, -0.26); hullS.quadraticCurveTo(0.85, -0.2, 0.95, 0); hullS.quadraticCurveTo(0.85, 0.2, 0.45, 0.26); hullS.lineTo(-0.75, 0.26); hullS.lineTo(-0.75, -0.26);
    const hg = new THREE.ExtrudeGeometry(hullS, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }); hg.rotateX(Math.PI / 2); hg.translate(0, 0.27, 0);
    mk(hg, plastic("#7D8794", 0.45), 0, 0, 0, boat);
    mk(rb(1.7, 0.06, 0.56, 0.03), plastic("#E5E8EA", 0.5), -0.03, 0.29, 0, boat);
    mk(rb(0.55, 0.3, 0.42, 0.07), plastic("#E9ECEE", 0.4), -0.25, 0.47, 0, boat);
    mk(rb(0.42, 0.12, 0.44, 0.03), std({ color: "#20303A", roughness: 0.1, metalness: 0.3 }), -0.12, 0.52, 0, boat);
    mk(rb(1.72, 0.06, 0.58, 0.02), plastic("#E1000F", 0.5), 0, 0.17, 0, boat);
    mk(CYL(0.015, 0.015, 0.6, 6), brass, -0.35, 0.9, 0, boat);
    const lamp = mk(SPH(0.04, 8), new THREE.MeshBasicMaterial({ color: "#7FB2FF" }), -0.35, 1.2, 0, boat); void lamp;
  }
  boat.visible = false;
  const tagBoat = card("PATROLI", "TIAP 5 HARI", "BOTH", 1.35, { follow: boat, dy: 1.75, out: K.s7e });
  const wakeN = 26, wake = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), std({ color: "#EEF6F4", roughness: 0.5 }), wakeN); wake.visible = false; scene.add(wake);
  const PX = 1.95, PZ = 0.35;
  const bird = grp(PX, gy(PX, PZ) - 0.02, PZ);
  {
    const cu = plastic("#B0602A", 0.5), dk = plastic("#5A2E14", 0.5);
    const body = mk(SPH(0.3, 20), cu, 0, 0.42, 0, bird); body.scale.set(1.35, 0.85, 0.85);
    const nk = mk(CYL(0.08, 0.12, 0.35, 12), std({ color: "#1F4F4A", roughness: 0.3, metalness: 0.4, envMapIntensity: 1.2 }), 0.3, 0.68, 0, bird); nk.rotation.z = -0.5;
    mk(SPH(0.11, 14), std({ color: "#1C3F5A", roughness: 0.25, metalness: 0.4, envMapIntensity: 1.3 }), 0.42, 0.86, 0, bird);
    for (const s of [-1, 1]) mk(SPH(0.05, 10), plastic("#D22A2A", 0.5), 0.45, 0.87, s * 0.07, bird);
    mk(new THREE.ConeGeometry(0.03, 0.1, 6), plastic("#E8D9B0", 0.5), 0.55, 0.85, 0, bird).rotation.z = -Math.PI / 2;
    for (const s of [-1, 1]) mk(SPH(0.02, 8), gloss, 0.47, 0.9, s * 0.075, bird);
    const tail = mk(rb(0.95, 0.06, 0.14, 0.03), dk, -0.75, 0.62, 0, bird); tail.rotation.z = 0.35;
    const tail2 = mk(rb(0.75, 0.05, 0.1, 0.025), cu, -0.65, 0.66, 0.06, bird); tail2.rotation.z = 0.3;
    for (const s of [-1, 1]) mk(CYL(0.018, 0.018, 0.25, 6), plastic("#8A7A5A", 0.5), 0.02, 0.12, s * 0.1, bird);
    for (const s of [-1, 1]) { const w = mk(SPH(0.22, 14), dk, -0.05, 0.47, s * 0.2, bird); w.scale.set(1.3, 0.6, 0.3); }
  }
  bird.visible = false;
  const strike = grp(PX, gy(PX, PZ) + 0.62, PZ + 0.25);
  { const sm = std({ color: "#A8000E", roughness: 0.5, emissive: new THREE.Color("#5A0006"), emissiveIntensity: 0.4, envMapIntensity: 0.2 }); mk(new THREE.TorusGeometry(0.78, 0.07, 12, 64), sm, 0, 0, 0, strike, false); const bar = mk(rb(1.56, 0.13, 0.08, 0.03), sm, 0, 0, 0, strike, false); bar.rotation.z = -Math.PI / 4; }
  strike.visible = false;
  const tagBird = card("BURUNG PEGAR?", "TIDAK ADA DI PULAU", "", 1.75, { pos: new V3(PX + 0.1, 5.75, PZ + 0.3) });

  // ---------- fireflies (opaque emissive beads + bloom; dusk payoff) ----------
  const ffN = 34, ffG = new THREE.SphereGeometry(0.045, 8, 6), ffM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFD27A").multiplyScalar(4) });
  const ff = new THREE.InstancedMesh(ffG, ffM, ffN); ff.frustumCulled = false; scene.add(ff);
  const ffSeed = Array.from({ length: ffN }, (_, i) => { const q = mulberry(300 + i); return [q() * 6.283, 1.5 + q() * 5, 4.4 + q() * 6, 0.2 + q() * 0.4, q() * 6]; });

  // ---------- sovereignty schedule: flips of the flag + ring targets ----------
  // month centre angle (deg) on the ring; ring yaw = -angle brings that month under the front pointer
  const MC = (m) => m * 30 + 15;
  const EV = [
    [0, "F", MC(0)],
    [A("s1:berganti"), "S", MC(1)],
    [A("s1:Prancis"), "F", MC(7)],
    [A("s4:bersama"), "X", 390],
    [A("s5:Februari") + 0.25, "S", 360 + MC(1) + 360],
    [A("s5:Agustus") + 0.25, "F", 720 + MC(7)],
    [A("s6:Irun"), "S", 1080 + MC(1)],
    [A("s6:Hendaye"), "F", 1080 + MC(7)],
    [A("s8:Satu"), "S", 1440 + MC(1)],
    [A("s8:dua"), "F", 1440 + MC(7)],
    [A("s8:berbagi"), "X", 1800 + 30],
  ];
  const ringAt = (t) => {
    let a = EV[0][2];
    for (let i = 1; i < EV.length; i++) { const [te, , ang] = EV[i], prev = EV[i - 1][2], d = Math.min(1.1, Math.max(0.5, (te - EV[i - 1][0]) * 0.6)); if (t >= te - d) a = prev + (ang - prev) * smooth((t - te + d) / d); }
    return a;
  };
  const stateAt = (t) => { let s = EV[0][1], prev = EV[0][1], te = -9; for (const e of EV) if (t >= e[0]) { prev = s; s = e[1]; te = e[0]; } return { s, prev, te }; };
  const TINT = { S: [new THREE.Color("#FF5A2E"), new THREE.Color("#FFC21A")], F: [new THREE.Color("#3D6BFF"), new THREE.Color("#5A86FF")], X: [new THREE.Color("#FF4A2E"), new THREE.Color("#3D6BFF")] };

  // ---------- camera ----------
  const cv = (tx, ty, tz, d, el, yaw = 0) => { const e = el * Math.PI / 180, y = yaw * Math.PI / 180; return [tx + d * Math.cos(e) * Math.sin(y), ty + d * Math.sin(e), tz + d * Math.cos(e) * Math.cos(y), tx, ty, tz]; };
  const keys = [
    [0, ...cv(0, 10.6, 0, 60, 13, -30)],
    [K.s1e, ...cv(0, 10.4, 0, 55, 15, 6)],
    [K.s2 + 1.1, ...cv(0.2, 5.0, 0.4, 27, 30, 0)],
    [A("s2:Panjangnya"), ...cv(0.4, 4.6, 0.5, 25.5, 31, 3)],
    [K.s2e, ...cv(0.4, 4.6, 0.5, 24.5, 32, 6)],
    [K.s3 + 1.3, ...cv(-1.45, 4.2, 0, 12.5, 30, -12)],
    [A("s3:Hasilnya"), ...cv(-1.1, 4.2, 0, 12, 30, -5)],
    [A("s3:Perjanjian") + 0.25, ...cv(0.6, 4.5, 0.1, 11, 26, 8)],
    [K.s3e, ...cv(0.6, 4.5, 0.1, 10.8, 26, 11)],
    [K.s4 + 1.1, ...cv(3.1, 5.9, 0.2, 17, 17, 8)],
    [A("s4:Raja") - 0.2, ...cv(2.9, 5.8, 0.2, 17, 17, 5)],
    [A("s4:Louis") + 0.6, ...cv(2.2, 4.3, 0, 11.5, 28, 4)],
    [K.s4e, ...cv(2.2, 4.3, 0, 11.3, 28, 9)],
    [K.s5 + 1.3, ...cv(0, 1.4, 6.0, 30, 44, 0)],
    [K.s5e, ...cv(0, 1.4, 6.0, 29, 46, 5)],
    [K.s6 + 1.1, ...cv(0, 6.7, 1.4, 15, 15, -7)],
    [A("s6:Salah"), ...cv(0, 6.7, 1.4, 14.5, 15, 0)],
    [A("s6:Pierre") + 0.25, ...cv(-1.8, 4.2, 0, 11.5, 28, -8)],
    [A("s6:Dalam") + 0.2, ...cv(-1.8, 4.2, 0, 11.5, 28, -3)],
    [A("s6:wali"), ...cv(0, 3.6, 0, 31, 47, 0)],
    [K.s6e, ...cv(0, 3.6, 0, 30.5, 48, 4)],
    [K.s7 + 1.0, ...cv(0, 4.6, 0, 25, 27, -15)],
    [A("s7:Tidak") + 0.3, ...cv(-2.6, 4.3, 0.5, 11.5, 28, -10)],
    [A("s7:petugas") + 0.3, ...cv(-2.9, 4.3, 0.3, 11.5, 28, -4)],
    [A("s7:patroli") + 0.4, ...cv(0, 4.2, 0, 22, 25, 10)],
    [A("s7:Lucunya"), ...cv(0.3, 4.2, 0, 21, 25, 15)],
    [A("s7:burung") + 0.1, ...cv(1.9, 4.2, 0.3, 10, 26, 6)],
    [K.s7e, ...cv(1.9, 4.2, 0.3, 10, 26, 10)],
    [A("s8:berbagi"), ...cv(0, 9.2, 0, 44, 17, 2)],
    [A("s8:Menurut"), ...cv(0, 9.6, 0, 52, 16, 12)],
    [K.dur, ...cv(0, 9.6, 0, 55, 16, 22)],
  ];
  const camT = track(keys);
  const tgt = new V3(), tmp = new V3();
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const popS = (t, a, b, d = 0.4) => (t < a || t > b + 0.3 ? 0 : t < b ? back(clamp01((t - a) / d), 1.7) : 1 - eout((t - b) / 0.3));
  const show = (o, k, base = 1) => { o.visible = k > 0.002; o.scale.setScalar(Math.max(0.0001, k * base)); };
  const placeP = (P, x, z, ry, t, a, b, walkFrom = null) => {
    const k = popS(t, a, b, 0.45); P.G.visible = k > 0.002; P.G.scale.setScalar(Math.max(0.0001, P.s * k));
    let px = x, pz = z, amp = 0;
    if (walkFrom && t < a + 1.2) { const u = smooth(clamp01((t - a) / 1.2)); px = walkFrom[0] + (x - walkFrom[0]) * u; pz = walkFrom[1] + (z - walkFrom[1]) * u; amp = 1 - u; }
    P.G.position.set(px, gy(px, pz) - 0.03, pz); P.G.rotation.y = ry;
    walk(P, t * 7 + P.ph, amp); life(P, t);
  };
  const dayK = [[0, 0], [K.s4, 0.15], [K.s6, 0.35], [K.s7, 0.55], [K.s8, 0.82], [K.end, 1]];
  const dayAt = (t) => { for (let i = 1; i < dayK.length; i++) if (t <= dayK[i][0]) { const [a, va] = dayK[i - 1], [b, vb] = dayK[i]; return va + (vb - va) * smooth((t - a) / (b - a)); } return 1; };
  const cTop = new THREE.Color(), cMid = new THREE.Color(), cBot = new THREE.Color();
  const wO = new THREE.Object3D();

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Fraunces"`) && document.fonts.check(`600 40px "IBM Plex Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.12, c[1] + Math.sin(t * 0.29) * 0.08, c[2] + Math.cos(t * 0.31) * 0.1);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    sky.position.copy(cam.position);
    // close to the jar the glass reflections would veil the island: fade them with camera distance
    const dC = cam.position.distanceTo(tgt), gk = smooth((dC - 14) / 26);
    glassM.envMapIntensity = 0.18 + 1.17 * gk; glassM.clearcoat = 0.25 + 0.75 * gk; rimM.uniforms.k.value = 0.25 + 0.5 * gk;

    // day cycle: amber morning to violet dusk
    const dU = dayAt(t);
    cTop.copy(SKY.am[0]).lerp(SKY.pm[0], dU); cMid.copy(SKY.am[1]).lerp(SKY.pm[1], dU); cBot.copy(SKY.am[2]).lerp(SKY.pm[2], dU);
    skyU.top.value.copy(cTop); skyU.mid.value.copy(cMid); skyU.bot.value.copy(cBot);
    scene.fog.color.copy(cMid);
    key.color.setHSL(0.09 - 0.03 * dU, 0.75 + 0.15 * dU, 0.82 - 0.12 * dU); key.intensity = 2.6 - 0.75 * dU;
    hemi.intensity = 0.75 - 0.2 * dU;
    const night = smooth((dU - 0.78) / 0.22);
    capM.emissiveIntensity = 1.6 * night;
    ffL.intensity = 3.5 * night;

    // calendar ring + flag + tint
    ringG.rotation.y = -ringAt(t) * Math.PI / 180;
    const st = stateAt(t), fu = clamp01((t - st.te + 0.28) / 0.56);
    const flipK = st.te > 0 && fu < 1 ? Math.abs(1 - 2 * fu) : 1;
    const shown = st.te > 0 && fu < 0.5 ? st.prev : st.s;
    if (mainFlag.m.material.map !== flagTex[shown]) { mainFlag.m.material.map = flagTex[shown]; mainFlag.m.material.needsUpdate = true; }
    mainFlag.F.scale.x = Math.max(0.02, flipK);
    mainFlag.F.rotation.y = -0.25 + 0.4 * (1 - flipK);
    const tu = smooth(clamp01((t - st.te + 0.3) / 0.7));
    const a0 = TINT[st.prev], a1 = TINT[st.s];
    tintL.color.copy(a0[0]).lerp(a1[0], tu); tintR.color.copy(a0[1]).lerp(a1[1], tu);
    const tI = 3.2 + 6 * pump(t, st.te - 0.1, 0.15, 1.2);
    tintL.intensity = tI; tintR.intensity = tI;
    ringM.emissiveIntensity = 0.12 + 0.25 * pump(t, st.te - 0.1, 0.15, 1.0);
    for (const f of flags) {
      const p = f.geo.attributes.position, b = f.base;
      for (let i = 0; i < p.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], u = x / f.w; p.setZ(i, u * 0.14 * Math.sin(t * 3.4 - x * 3 + f.ph) + u * 0.04 * Math.sin(t * 5.1 + y * 4 + f.ph)); }
      p.needsUpdate = true; f.geo.computeVertexNormals();
    }
    waterN.offset.set(t * 0.035, t * 0.008);
    placeFerns(t);

    // s2: tags + rulers
    show(tagRiver.m, popS(t, A("s2:Bidasoa") - 0.15, K.s2e));
    show(tagES.m, popS(t, A("s2:Spanyol") - 0.15, K.s3 + 0.6));
    show(tagFR.m, popS(t, A("s2:Prancis") - 0.15, K.s3 + 0.6));
    const uL = eout(clamp01((t - A("s2:dua") + 0.25) / 0.7)), uW = eout(clamp01((t - A("s2:empat") + 0.25) / 0.6));
    const rOut = t > K.s2e ? 1 - clamp01((t - K.s2e) / 0.4) : 1;
    rulerL.visible = uL > 0.002 && rOut > 0; rulerL.scale.set(Math.max(0.001, uL), rOut, rOut);
    rulerW.visible = uW > 0.002 && rOut > 0; rulerW.scale.set(rOut, rOut, Math.max(0.001, uW));
    show(tag200.m, popS(t, A("s2:dua") + 0.15, K.s2e));
    show(tag40.m, popS(t, A("s2:empat") + 0.15, K.s2e));
    show(tagIsl.m, popS(t, A("s2:Pheasant") - 0.1, A("s2:Panjangnya") - 0.3) + popS(t, A("s2:tidak") - 0.1, K.s2e));

    // s3: the conference
    { const k = t < K.s3 - 0.3 ? 0 : back(clamp01((t - K.s3 + 0.3) / 0.5), 1.4); table.visible = k > 0.002; table.scale.setScalar(Math.max(0.0001, k)); }
    placeP(haro, TX - 1.05, 0.0, Math.PI / 2, t, A("s3:Luis") - 0.35, K.s4 - 0.2, [TX - 2.3, 0.4]);
    placeP(maza, TX + 1.05, 0.0, -Math.PI / 2, t, A("s3:Mazarin") - 0.35, K.s4 - 0.2, [TX + 2.3, -0.3]);
    const nSh = Math.floor(24 * clamp01((t - A("s3:dua") + 0.1) / (A("s3:kali") + 0.3 - A("s3:dua") + 0.1)));
    sheets.forEach((m, i) => { m.visible = i < nSh && t < K.s6 + 0.3; });
    const uT = eout(clamp01((t - A("s3:Perjanjian") + 0.1) / 0.5));
    treaty.visible = uT > 0.002; treaty.scale.set(1, Math.max(0.001, uT), 1);
    show(tagMono.m, popS(t, A("s3:Perjanjian") + 0.3, K.s4 + 1.4));
    spot.position.set(MX + 0.6, 6.2, 1.6); spot.intensity = 10 * clamp01(pump(t, A("s3:Perjanjian"), 0.3, 2.2) + (t > A("s3:Perjanjian") && t < K.s4 ? 0.5 : 0));
    // s4: Louis XIV and Maria Theresa meet beside the table
    placeP(louis, 2.85, 0.1, -Math.PI / 2 + 0.3, t, A("s4:Louis") - 0.35, K.s5 + 1.0, [3.6, 0.4]);
    placeP(mt, 1.6, 0.1, Math.PI / 2 - 0.3, t, A("s4:putri") - 0.35, K.s5 + 1.0, [1.2, 0.5]);
    // s6: viceroy badge, Pierre Loti, towns
    const kB = popS(t, A("s6:raja") - 0.3, A("s6:Dalam"), 0.5);
    badge.visible = kB > 0.002; badge.scale.setScalar(Math.max(0.0001, kB)); badge.rotation.y = (1 - kB) * 2.4 + Math.sin(t * 0.8) * 0.12; badge.position.y = 7.2 + Math.sin(t * 1.3) * 0.08;
    placeP(loti, TX - 1.0, 0.05, 0.35, t, A("s6:Pierre") - 0.35, A("s6:wali") + 0.6, [TX - 1.9, 0.4]);
    const lI = clamp01(pump(t, A("s6:Irun"), 0.15, 2.5) + (t > A("s6:Irun") ? 0.4 : 0)), lH = clamp01(pump(t, A("s6:Hendaye"), 0.15, 2.5) + (t > A("s6:Hendaye") ? 0.4 : 0));
    winM.emissiveIntensity = 0.3 + 1.6 * Math.max(lI, lH) + 1.4 * night;
    towns.irun.forEach((h, i) => { const k = pump(t, A("s6:Irun") + i * 0.03, 0.12, 0.5); h.scale.set(1, 1 + 0.25 * k, 1); });
    towns.hend.forEach((h, i) => { const k = pump(t, A("s6:Hendaye") + i * 0.03, 0.12, 0.5); h.scale.set(1, 1 + 0.25 * k, 1); });
    show(tagIrun.m, popS(t, A("s6:Irun") - 0.15, K.s7 + 0.4));
    show(tagHend.m, popS(t, A("s6:Hendaye") - 0.15, K.s7 + 0.4));
    // s7: no entry, cleaner, patrol boat, pheasant
    const kN = popS(t, A("s7:Tidak") - 0.2, 1e9, 0.45); NE.visible = kN > 0.002; NE.scale.setScalar(Math.max(0.0001, kN));
    placeP(clean, -2.95, -0.15, 0.5, t, A("s7:petugas") - 0.4, A("s7:Lucunya") + 0.4, [-3.4, -0.45]);
    clean.arms[1].sh.rotation.x = -0.4 + 0.35 * Math.sin(t * 5);
    const tb = A("s7:patroli") - 0.6;
    const kBo = popS(t, tb, 1e9, 0.5);
    boat.visible = kBo > 0.002;
    const ang = (t - tb) * 0.42 + 1.15;
    const bx = Math.cos(ang) * 6.4, bz = Math.sin(ang) * 2.4;
    boat.position.set(bx, WATER - 0.12 + 0.03 * Math.sin(t * 3), bz);
    boat.rotation.set(0.03 * Math.sin(t * 2.3), Math.atan2(-2.4 * Math.cos(ang), -6.4 * Math.sin(ang)), 0.04 * Math.sin(t * 2.9));
    boat.scale.setScalar(Math.max(0.0001, kBo * 0.92));
    wake.visible = boat.visible;
    for (let i = 0; i < wakeN; i++) { const a2 = ang - (i + 1) * 0.045, s = (0.05 + i * 0.012) * kBo * (1 - i / wakeN); wO.position.set(Math.cos(a2) * 6.4 + Math.sin(i * 1.7) * 0.05 * i * 0.1, WATER + 0.01, Math.sin(a2) * 2.4 + (i % 2 ? 1 : -1) * i * 0.012); wO.scale.set(s * 2.2, s * 0.2, s * 1.4); wO.rotation.y = -a2; wO.updateMatrix(); wake.setMatrixAt(i, wO.matrix); }
    wake.instanceMatrix.needsUpdate = true;
    const kBd = popS(t, A("s7:burung") - 0.3, K.s8 + 0.6, 0.45);
    bird.visible = kBd > 0.002; bird.scale.setScalar(Math.max(0.0001, kBd)); bird.rotation.y = -0.5 + Math.sin(t * 1.1) * 0.15;
    const kX = popS(t, A("s7:tidak") - 0.1, K.s8 + 0.5, 0.3);
    strike.visible = kX > 0.002; strike.scale.setScalar(Math.max(0.0001, kX)); strike.quaternion.copy(cam.quaternion);
    show(tagBird.m, popS(t, A("s7:burung"), K.s8 + 0.4));

    // fireflies drift around the island at dusk
    for (let i = 0; i < ffN; i++) { const q = ffSeed[i]; const a3 = q[0] + t * q[3] * 0.4; const rr = Math.min(7.2, q[2]); wO.position.set(Math.cos(a3) * rr * 0.9, q[1] + 3.4 + Math.sin(t * 1.3 + q[4]) * 0.4, Math.sin(a3) * rr * 0.6); const blink = 0.5 + 0.5 * Math.sin(t * 2.4 + q[4] * 3); wO.scale.setScalar(Math.max(0.0001, night * (0.4 + 0.8 * blink))); wO.rotation.set(0, 0, 0); wO.updateMatrix(); ff.setMatrixAt(i, wO.matrix); }
    ff.instanceMatrix.needsUpdate = true; ff.visible = night > 0.01;

    // cards: billboard, follow their owner
    for (const cd of cards) {
      if (t > cd.out) { cd.m.visible = false; continue; }
      const dz = Math.min(2.1, Math.max(1, cam.position.distanceTo(cd.m.position) / 13.5));
      const hh = cd.m.geometry.parameters.height / 2;
      if (cd.follow) { const o = cd.follow.G || cd.follow; cd.m.visible = o.visible; if (!o.visible) continue; tmp.copy(o.position); const ks = Math.max(0.0001, Math.min(1, o.scale.x / (cd.follow.s || 1))); cd.m.position.set(tmp.x, tmp.y + cd.dy + hh * (dz - 1), tmp.z); cd.m.scale.setScalar(ks * dz); }
      else { cd.m.position.copy(cd.pos); cd.m.position.y += hh * (dz - 1); if (cd.m.visible) cd.m.scale.multiplyScalar(dz); }
      cd.m.quaternion.copy(cam.quaternion);
    }
    comp.render();
  };
}
