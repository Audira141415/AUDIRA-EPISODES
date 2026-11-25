// EP52 DISASTERSIM: the Halifax Explosion (6 December 1917) as a calm "harbour lab" explainer.
// A sliced diorama block of Halifax harbour sits on a plinth in a slate lab: The Narrows runs along x
// (harbour mouth / Atlantic at -x, Bedford Basin at +x), Halifax + Richmond on the far shore (-z), Dartmouth near (+z).
// The cut faces show strata and the water column. Ships are exaggerated ×3 (diagram scale, labelled on the plinth).
// Mont-Blanc has a clipping-plane cutaway hold (TNT / ASAM PIKRAT crates) and benzol drums on deck; Imo is empty and
// painted BANTUAN BELGIA. Explosion = opaque lit smoke column + mushroom cap (no glowing glassy shells), a ground
// pressure ring, the 800 m radius ring (25 units), a harbour wave heightfield and houses flattening as the ring passes.
// Stations (pure function of t):
//   s1 hook: the gentle bump, a 20-minute time-lapse drift to Pier 6, the blast column
//   s2 rewind to morning: establishing aerial with place labels, convoy gathering at the mouth, route to Europe
//   s3 Mont-Blanc enters (cutaway cargo), Imo leaves the basin too fast on the wrong side
//   s4 the bump at walking pace, drums split, sparks, deck fire; Mont-Blanc drifts to Pier 6
//   s5 crew row to Dartmouth, watchers at windows, Coleman's telegraph post, the passenger train halts
//   s6 09.04.35 blast, 800 m ring, flattening, harbour wave, window glass
//   s7 calm grey aftermath, Coleman's empty post, snowstorm, relief train "DARI BOSTON"
//   s8 the city rises again, evening lights; a tree crate ship sails HALIFAX → BOSTON
const FONTS = ['900 80px Archivo', '800 80px Archivo', '700 80px "IBM Plex Mono"', '500 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA TNT 800 m"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, back, eout, canvasTex, stage, pts, envStrips } from "./lib3d.js";

const V3 = THREE.Vector3;
const SANS = 'Archivo, "Segoe UI", sans-serif', MONO = '"IBM Plex Mono", Consolas, monospace';

function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
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
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const lerp = (a, b, u) => a + (b - a) * u;

// ---------------- harbour geometry (shared) ----------------
const XB = 36, ZB = 32, YB = -11;
const zc = (x) => 1.5 * Math.sin(x * 0.06);
const hw = (x) => 4.5 + 9 * smooth((x - 22) / 10) + 6 * smooth((-x - 24) / 10);
function landH(x, z) {
  const d = Math.abs(z - zc(x)), w = hw(x);
  let y = lerp(-5, 1.0, smooth((d - w) / 4));
  const e = Math.max(0, d - w - 6);
  y += z < zc(x) ? Math.min(3.0, 0.1 * e) : Math.min(1.4, 0.05 * e);
  y += 0.06 * Math.sin(x * 0.7 + z * 0.3) * smooth((d - w) / 4);
  return y;
}
const railZ = (x) => zc(x) - hw(x) - 5;
const E = new V3(2, 0, -3.6);       // Mont-Blanc at Pier 6, the blast centre
const R800 = 25;                    // 800 m at map scale (Narrows ≈ 500 m ≈ 16 units)

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x101820, exp: 1.0, bloom: [0.05, 0.3, 0.97], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  r.localClippingEnabled = true;
  envStrips(r, scene, [
    [14, 6, 0xfff0dc, 3.0, 0, 10, 2], [10, 3, 0xffc58a, 2.0, -10, 3, 6], [8, 4, 0xa8c4ff, 1.3, 10, 4, -8],
    [20, 2, 0xffe6c8, 1.4, 0, 1, -12], [20, 20, 0x2a2a2a, 0.6, 0, -10, 0]], 0x141210);
  scene.environmentIntensity = 0.45;
  scene.background = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#26313d"); gr.addColorStop(0.55, "#17202a"); gr.addColorStop(1, "#0b1016"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0x17202a, 140, 330);
  cam.near = 0.2; cam.far = 900; cam.updateProjectionMatrix();

  const hemi = new THREE.HemisphereLight(0xdfe8f2, 0x4a3a2c, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe4c4, 2.5);
  sun.position.set(-40, 70, 55); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 10, far: 220 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0xaecbff, 0.7); rim.position.set(40, 30, -70); scene.add(rim);
  const fireL = new THREE.PointLight(0xff7a2a, 0, 30, 1.8); scene.add(fireL);
  const blastL = new THREE.PointLight(0xffa860, 0, 140, 1.2); scene.add(blastL);

  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const std = (color, rough = 0.6, metal = 0, ex = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...ex });
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...o });

  // ---------- billboard labels ----------
  const labels = [];
  function plate(text, { font = SANS, weight = 800, h = 1, color = "#EAF4F6", bg = "rgba(12,18,24,.86)", bd = "#3FC6D4", pad = 0.4 } = {}) {
    const CH = 160, fpx = Math.round(CH * 0.56);
    const mc = document.createElement("canvas").getContext("2d"); mc.font = `${weight} ${fpx}px ${font}`;
    const tw = mc.measureText(text).width, CW = Math.ceil(tw + CH * pad * 2);
    const tex = canvasTex(CW, CH, (g, w, hh) => {
      g.clearRect(0, 0, w, hh);
      g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, hh - 8, 18); g.fill();
      g.fillStyle = bd; g.fillRect(4, 4, 16, hh - 8);
      g.strokeStyle = bd; g.lineWidth = 5; g.beginPath(); g.roundRect(4, 4, w - 8, hh - 8, 18); g.stroke();
      g.font = `${weight} ${fpx}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = color; g.fillText(text, w / 2 + 6, hh / 2 + 4);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(h * CW / CH, h), basic({ map: tex, fog: false, toneMapped: false, depthTest: false }));
    m.renderOrder = 9; m.visible = false; scene.add(m); labels.push(m);
    return m;
  }
  const showLab = (m, k, pos, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.position.copy(pos); m.quaternion.copy(cam.quaternion); const d = cam.position.distanceTo(pos); m.scale.setScalar(Math.max(0.001, s * d / 30 * (0.6 + 0.4 * back(clamp01(k))))); };

  // ================= LAB: floor grid + plinth =================
  const gridT = canvasTex(512, 512, (g, w) => { g.fillStyle = "#121a22"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(90,140,160,.22)"; g.lineWidth = 2; for (let i = 0; i <= w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } g.strokeStyle = "rgba(90,140,160,.08)"; g.lineWidth = 1; for (let i = 0; i <= w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, [24, 24]);
  const floor = add(new THREE.PlaneGeometry(700, 700), std(0xffffff, 0.85, 0, { map: gridT }), 0, YB - 1.6, 0); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const plinthM = std(0x1d252d, 0.55, 0.2);
  add(new THREE.BoxGeometry(XB * 2 + 3, 1.6, ZB * 2 + 3), plinthM, 0, YB - 0.8, 0);
  {
    const pT = canvasTex(2048, 160, (g, w, h) => {
      g.fillStyle = "#0f151b"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#3FC6D4"; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16);
      g.font = `900 78px ${SANS}`; g.fillStyle = "#EAF4F6"; g.textBaseline = "middle"; g.fillText("AUDIRA", 40, h / 2 + 2);
      g.font = `700 44px ${MONO}`; g.fillStyle = "#3FC6D4"; g.fillText("HARBOUR LAB  //  HALIFAX 6.12.1917  //  MODEL: KAPAL DIPERBESAR ×3", 400, h / 2 + 2);
    });
    const pl = add(new THREE.PlaneGeometry(36, 2.8), std(0xffffff, 0.5, 0.1, { map: pT }), 0, YB - 0.8, ZB + 1.52); pl.castShadow = false; pl.scale.y = 0.5;
  }

  // ================= LAND TOP =================
  const landT = canvasTex(1536, 1366, (g, w, h) => {
    const q = mulberry(5);
    const X = (x) => (x + XB) / (2 * XB) * w, Z = (z) => (z + ZB) / (2 * ZB) * h;
    g.fillStyle = "#6f6d55"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { const v = q(); g.fillStyle = v < 0.33 ? "rgba(90,96,62,.35)" : v < 0.66 ? "rgba(128,116,86,.3)" : "rgba(60,62,46,.3)"; g.fillRect(q() * w, q() * h, 3 + q() * 8, 2 + q() * 5); }
    // street grid (Halifax side), roads on Dartmouth
    g.strokeStyle = "rgba(170,160,140,.75)"; g.lineWidth = 7;
    for (let x = -34; x <= 34; x += 6.4) { g.beginPath(); for (let z = -32; z <= 0; z += 1) { const ok = landH(x, z) > 0.4; if (ok) g.lineTo(X(x), Z(z)); else g.moveTo(X(x), Z(z)); } g.stroke(); }
    for (let z = -31; z <= -6; z += 4.8) { g.beginPath(); g.moveTo(X(-36), Z(z)); for (let x = -36; x <= 36; x += 1) { const ok = landH(x, z) > 0.4 && z < railZ(x) - 1; if (ok) g.lineTo(X(x), Z(z)); else g.moveTo(X(x), Z(z)); } g.stroke(); }
    g.strokeStyle = "rgba(160,150,130,.6)"; g.lineWidth = 6;
    g.beginPath(); for (let x = -36; x <= 36; x += 1) { const z = zc(x) + hw(x) + 4.2; g.lineTo(X(x), Z(z)); } g.stroke();
    // shore sand band
    for (let x = -36; x <= 36; x += 0.25) for (const s of [-1, 1]) { const z = zc(x) + s * (hw(x) + 2.8); g.fillStyle = "rgba(170,150,110,.55)"; g.fillRect(X(x) - 3, Z(z) - 7, 6, 14); }
  });
  const landG = new THREE.PlaneGeometry(XB * 2, ZB * 2, 180, 160); landG.rotateX(-Math.PI / 2);
  { const p = landG.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, landH(p.getX(i), p.getZ(i))); landG.computeVertexNormals(); }
  const land = add(landG, std(0xffffff, 0.92, 0, { map: landT })); land.castShadow = false;
  const snowM = new THREE.MeshStandardMaterial({ color: 0xdfe5ea, roughness: 0.8, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const landSnow = new THREE.Mesh(landG, snowM); landSnow.position.y = 0.04; landSnow.receiveShadow = true; scene.add(landSnow);

  // ================= CUT FACES (strata + water column) =================
  const strataT = canvasTex(512, 512, (g, w, h) => {
    const bands = [[0, "#5b4a36"], [0.06, "#7c6448"], [0.2, "#8d7a5e"], [0.38, "#6c6458"], [0.56, "#4c4a48"], [0.76, "#353536"], [1, "#2a2a2c"]];
    for (let i = 0; i < bands.length - 1; i++) { g.fillStyle = bands[i][1]; g.fillRect(0, bands[i][0] * h, w, (bands[i + 1][0] - bands[i][0]) * h + 1); }
    const q = mulberry(9);
    for (let i = 0; i < 2600; i++) { const y = q() * h; g.fillStyle = `rgba(${q() < 0.5 ? "20,16,12" : "200,190,170"},${0.08 + q() * 0.12})`; g.beginPath(); g.ellipse(q() * w, y, 2 + q() * 7, 1 + q() * 3, 0, 0, 6.3); g.fill(); }
    g.fillStyle = "#4f5a36"; g.fillRect(0, 0, w, 6);
  });
  strataT.wrapS = THREE.RepeatWrapping;
  const waterCutT = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3f9fb5"); gr.addColorStop(0.08, "#24748c"); gr.addColorStop(1, "#0c2a3c"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 0, w, 4); });
  const strataM = std(0xffffff, 0.9, 0, { map: strataT }), wcutM = std(0xffffff, 0.35, 0, { map: waterCutT, emissive: 0x0b3442, emissiveIntensity: 0.6 });
  function skirt(edge) {
    const P = [], U = [], I = [], W = [], WU = [], WI = [];
    const N = 160;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      let x, z; if (edge === "zp") { x = -XB + u * 2 * XB; z = ZB; } else if (edge === "zn") { x = XB - u * 2 * XB; z = -ZB; } else if (edge === "xp") { x = XB; z = ZB - u * 2 * ZB; } else { x = -XB; z = -ZB + u * 2 * ZB; }
      const top = landH(x, z);
      P.push(x, top, z, x, YB, z); U.push(u * 8, 1, u * 8, 0);
      W.push(x, 0, z, x, Math.min(0, top), z); WU.push(0, 1, 0, clamp01(-Math.min(0, top) / 5));
      if (i < N) { const a = i * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); if (top < 0 || landH(edge[0] === "z" ? -XB + (i + 1) / N * 2 * XB : (edge === "xp" ? XB : -XB), edge[0] === "z" ? (edge === "zp" ? ZB : -ZB) : 0) < 0) WI.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
    const m = new THREE.Mesh(g, strataM); m.material.side = THREE.DoubleSide; m.receiveShadow = true; scene.add(m);
    if (edge[0] === "x") {
      const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.Float32BufferAttribute(W, 3)); wg.setAttribute("uv", new THREE.Float32BufferAttribute(WU, 2));
      const WI2 = []; for (let i = 0; i < N; i++) { const a = i * 2; WI2.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } wg.setIndex(WI2); wg.computeVertexNormals();
      const wm = new THREE.Mesh(wg, wcutM); wm.material.side = THREE.DoubleSide; scene.add(wm);
    }
  }
  ["zp", "zn", "xp", "xn"].forEach(skirt);
  wcutM.side = THREE.DoubleSide; strataM.side = THREE.DoubleSide;

  // ================= WATER (heightfield for the harbour wave) =================
  const waterNT = canvasTex(512, 512, (g, w) => { g.fillStyle = "rgb(128,128,255)"; g.fillRect(0, 0, w, w); const q = mulberry(51); for (let i = 0; i < 2600; i++) { const x = q() * w, y = q() * w; g.fillStyle = `rgba(${q() < 0.5 ? "104,104,255" : "152,152,255"},.5)`; g.beginPath(); g.ellipse(x, y, 10 + q() * 16, 2 + q() * 3, 0, 0, 6.3); g.fill(); } }, [10, 9]);
  waterNT.colorSpace = THREE.NoColorSpace;
  const waterG = new THREE.PlaneGeometry(XB * 2, ZB * 2, 144, 128); waterG.rotateX(-Math.PI / 2);
  const WP = waterG.attributes.position, WR = new Float32Array(WP.count);
  for (let i = 0; i < WP.count; i++) WR[i] = Math.hypot(WP.getX(i) - E.x, WP.getZ(i) - E.z);
  const waterM = new THREE.MeshPhysicalMaterial({ color: 0x1d5a70, roughness: 0.42, metalness: 0.0, normalMap: waterNT, normalScale: new THREE.Vector2(0.3, 0.3), clearcoat: 0.15, clearcoatRoughness: 0.5 });
  const water = new THREE.Mesh(waterG, waterM); water.receiveShadow = true; scene.add(water);
  const FOAM = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 160), basic({ color: 0xd8e8ee, side: THREE.DoubleSide, depthWrite: false })); FOAM.rotation.x = -Math.PI / 2; FOAM.renderOrder = 2; scene.add(FOAM);
  let waveOn = false;
  function updateWater(a) {
    const on = a > 0 && a < 12;
    if (!on && !waveOn) { FOAM.visible = false; return; }
    waveOn = on;
    const rw = 2 + 1.9 * a, amp = on ? 1.6 * Math.exp(-a / 5) * (1 - smooth((a - 9) / 3)) : 0;
    for (let i = 0; i < WP.count; i++) {
      const d = WR[i] - rw;
      WP.setY(i, amp ? amp * (Math.exp(-((d / 2.0) ** 2)) - 0.35 * Math.exp(-(((d + 3.5) / 2.2) ** 2))) : 0);
    }
    WP.needsUpdate = true; waterG.computeVertexNormals();
    FOAM.visible = amp > 0.02; FOAM.scale.set(rw + 0.6, rw + 0.6, 1); FOAM.position.set(E.x, amp * 0.9 + 0.05, E.z); FOAM.material.opacity = Math.min(0.85, amp * 0.7);
  }

  // ================= RAIL =================
  const railG = (off) => { const P = []; for (let x = -XB; x <= XB; x += 0.5) P.push(new V3(x, landH(x, railZ(x) + off) + 0.08, railZ(x) + off)); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 220, 0.05, 5); };
  add(railG(-0.25), std(0x9a948c, 0.3, 0.8)).castShadow = false; add(railG(0.25), std(0x9a948c, 0.3, 0.8)).castShadow = false;
  {
    const tie = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.06, 0.8), std(0x4a3a2c, 0.9), 150); scene.add(tie);
    const d = new THREE.Object3D(); let k = 0; for (let x = -XB + 0.3; x < XB && k < 150; x += 0.48, k++) { const z = railZ(x); d.position.set(x, landH(x, z) + 0.03, z); d.rotation.y = -Math.atan2(railZ(x + 0.2) - railZ(x - 0.2), 0.4); d.updateMatrix(); tie.setMatrixAt(k, d.matrix); } tie.count = k;
  }
  const onRail = (g, x) => { const z = railZ(x), y = landH(x, z); g.position.set(x, y + 0.08, z); g.rotation.set(0, -Math.atan2(railZ(x + 0.3) - railZ(x - 0.3), 0.6), 0); };

  // ================= HOUSES (instanced bodies + roofs) =================
  const H = [];
  {
    const q = mulberry(31);
    for (let x = -34; x <= 33; x += 1.6) for (let z = -31; z <= ZB - 1; z += 1.6) {
      const xx = x + (q() - 0.5) * 0.4, zz = z + (q() - 0.5) * 0.4;
      const y = landH(xx, zz); if (y < 0.55) continue;
      const hal = zz < zc(xx);
      if (hal && zz > railZ(xx) - 1.2) continue;
      if (!hal && (q() < 0.5 || (xx > -17 && xx < 13))) continue;
      if (Math.abs(xx - 5) < 2.2 && Math.abs(zz + 13) < 2) continue; // refinery
      if (Math.abs(xx + 4) < 2.2 && Math.abs(zz - (railZ(-4) - 1.2)) < 2.2) continue; // post
      if (Math.abs(((xx + 34) % 6.4)) < 0.5 || Math.abs(((zz + 31) % 4.8)) < 0.4) { if (hal) continue; }
      const w = 0.8 + q() * 0.4, d = 0.8 + q() * 0.4, h = 0.6 + q() * 0.7 + (hal ? 0.1 : 0);
      H.push({ x: xx, z: zz, y, w, d, h, ry: (q() - 0.5) * 0.12, dist: Math.hypot(xx - E.x, zz - E.z), seed: q(), col: q(), hal });
    }
  }
  {
    const q = mulberry(77), T = [];
    for (let i = 0; i < 260; i++) { const x = -16 + q() * 28, z = zc(x) + hw(x) + 3.4 + q() * 22; if (z > ZB - 0.6) continue; const y = landH(x, z); if (y < 0.5) continue; T.push([x, y, z, 0.6 + q() * 0.6]); }
    const TM = new THREE.InstancedMesh(new THREE.ConeGeometry(0.45, 1.6, 7).translate(0, 0.8, 0), std(0x2f4a34, 0.85), T.length); TM.castShadow = true; TM.receiveShadow = true; scene.add(TM);
    const d = new THREE.Object3D(); T.forEach(([x, y, z, s], i) => { d.position.set(x, y, z); d.scale.setScalar(s); d.updateMatrix(); TM.setMatrixAt(i, d.matrix); });
  }
  const HN = H.length;
  const bodyG = new THREE.BoxGeometry(1, 1, 1); bodyG.translate(0, 0.5, 0);
  const roofG = new THREE.CylinderGeometry(0, 0.75, 1, 4, 1); roofG.rotateY(Math.PI / 4); roofG.translate(0, 0.5, 0); roofG.scale(1, 1, 1);
  const HB = new THREE.InstancedMesh(bodyG, std(0xffffff, 0.8), HN), HR = new THREE.InstancedMesh(roofG, std(0xffffff, 0.75), HN);
  HB.castShadow = HB.receiveShadow = HR.castShadow = HR.receiveShadow = true; scene.add(HB, HR);
  const BODYC = [0xe8dfcc, 0xcfc3ab, 0xb9b2a4, 0xd9c9a3, 0xa9b4b8, 0xe1d6c2, 0xbfa58a].map((c) => new THREE.Color(c));
  const ROOFC = [0x6b3b2e, 0x4a4a4e, 0x7a4632, 0x3d4247, 0x8a5a3a].map((c) => new THREE.Color(c));
  const snowC = new THREE.Color(0xdfe5ea), charC = new THREE.Color(0x3c3632), tmpC = new THREE.Color();
  H.forEach((h, i) => { HB.setColorAt(i, BODYC[Math.floor(h.col * BODYC.length)]); HR.setColorAt(i, ROOFC[Math.floor(h.seed * ROOFC.length)]); });
  // sugar refinery + Pier 6 shed (with an AUDIRA sign) + Coleman's telegraph post
  const BIG = [];
  { const g = new THREE.Group(); g.position.set(5, landH(5, -13), -13); scene.add(g); add(new THREE.BoxGeometry(3.6, 4.2, 2.6), std(0x9a5a44, 0.85), 0, 2.1, 0, g); add(new THREE.BoxGeometry(3.8, 0.3, 2.8), std(0x3e3a38, 0.8), 0, 4.3, 0, g); add(new THREE.CylinderGeometry(0.25, 0.32, 3.2, 10), std(0x6e3e30, 0.9), 1.2, 5.6, 0.5, g); BIG.push({ g, dist: Math.hypot(5 - E.x, -13 - E.z), seed: 0.3 }); }
  const PIER = new THREE.Group(); scene.add(PIER);
  {
    const wood = std(0x6e5640, 0.85);
    add(new THREE.BoxGeometry(2.4, 0.25, 4.6), wood, 2, 0.55, -6.4, PIER);
    for (const x of [1, 3]) for (const z of [-8, -6.6, -5.2, -4.4]) add(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), std(0x3d3128, 0.9), x, -1.8, z, PIER);
    const shedT = canvasTex(512, 200, (g, w, h) => { g.fillStyle = "#5a4636"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 18) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x, 0, 2, h); } g.fillStyle = "#1c3a2c"; g.fillRect(40, 30, w - 80, 110); g.strokeStyle = "#e9dcc0"; g.lineWidth = 5; g.strokeRect(46, 36, w - 92, 98); g.font = `900 70px ${SANS}`; g.fillStyle = "#f1e6cc"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, 78); g.font = `700 26px ${MONO}`; g.fillStyle = "#e7b35a"; g.fillText("PIER 6 · DERMAGA", w / 2, 168); });
    const shed = add(new THREE.BoxGeometry(2.0, 1.2, 1.6), [std(0x5a4636, 0.85), std(0x5a4636, 0.85), std(0x3a3430, 0.8), std(0x3a3430, 0.8), std(0xffffff, 0.8, 0, { map: shedT }), std(0x5a4636, 0.85)], 2, 1.25, -7.4, PIER);
    BIG.push({ g: shed, dist: 3.5, seed: 0.7, pier: true });
  }
  const POST = new THREE.Group(); scene.add(POST);
  {
    const z = railZ(-4) - 1.2; POST.position.set(-4, landH(-4, z), z);
    add(new THREE.BoxGeometry(1.3, 1.0, 1.0), std(0x8a3c2c, 0.8), 0, 0.5, 0, POST);
    const rf = add(new THREE.CylinderGeometry(0, 1.0, 0.5, 4, 1), std(0x2f2b2a, 0.8), 0, 1.25, 0, POST); rf.rotation.y = Math.PI / 4;
    add(new THREE.BoxGeometry(0.4, 0.5, 0.05), std(0xf2e7c8, 0.4, 0, { emissive: 0xffc070, emissiveIntensity: 0.25 }), 0.3, 0.55, 0.51, POST);
    add(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), std(0x3a2e24, 0.9), 0.9, 1.3, 0.2, POST);
    add(new THREE.BoxGeometry(0.5, 0.06, 0.06), std(0x3a2e24, 0.9), 0.9, 2.5, 0.2, POST);
  }
  // signal post (turns red when the train is stopped)
  const SIG = new THREE.Group(); scene.add(SIG); { const x = 20, z = railZ(20) - 0.9; SIG.position.set(x, landH(x, z), z); add(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), std(0x2a2a2a, 0.6, 0.5), 0, 0.9, 0, SIG); }
  const sigLamp = add(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshStandardMaterial({ color: 0x223322, emissive: 0x44ff66, emissiveIntensity: 0.5 }), 0, 1.75, 0.08, SIG);
  // window glows (shore-facing houses): warm squares with a dark head silhouette (watchers, no faces)
  const winT = canvasTex(64, 64, (g, w) => { g.fillStyle = "#ffcf86"; g.fillRect(0, 0, w, w); g.fillStyle = "#3a2a1c"; g.fillRect(0, 0, w, 6); g.fillRect(0, w - 6, w, 6); g.fillRect(0, 0, 6, w); g.fillRect(w - 6, 0, 6, w); g.fillRect(w / 2 - 3, 0, 6, w); g.fillStyle = "rgba(40,28,20,.85)"; g.beginPath(); g.arc(w * 0.3, w * 0.55, 9, 0, 6.3); g.fill(); g.fillRect(w * 0.3 - 14, w * 0.7, 28, 20); g.beginPath(); g.arc(w * 0.72, w * 0.58, 8, 0, 6.3); g.fill(); g.fillRect(w * 0.72 - 12, w * 0.72, 24, 18); });
  const WSEL = H.map((h, i) => [h, i]).filter(([h]) => h.hal && h.z > railZ(h.x) - 5 && Math.abs(h.x - 2) < 20);
  const WG = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.36), new THREE.MeshBasicMaterial({ map: winT, toneMapped: false, color: 0xd9b07a }), WSEL.length * 2); scene.add(WG);

  // ================= PEOPLE (generic figures: face, shoulders > hips, bent joints) =================
  const SKINS = [0xd9a982, 0xb98463, 0xe8c1a0, 0x8d5f43], CLOTH = [0x2f3d55, 0x5a3a2a, 0x3d4a3a, 0x6a6058, 0x23303a, 0x7a2f2a];
  function person(i, s = 0.28) {
    const skin = std(SKINS[i % 4], 0.6), cl = std(CLOTH[i % 6], 0.85), pa = std(0x2a2a30, 0.85), eye = std(0x111111, 0.3);
    const G = new THREE.Group(); G.scale.setScalar(s);
    const limb = (parent, x, y, len, w, mat) => { const p = new THREE.Group(); p.position.set(x, y, 0); parent.add(p); add(new THREE.CylinderGeometry(w, w * 0.85, len, 8), mat, 0, -len / 2, 0, p); const j = new THREE.Group(); j.position.y = -len; p.add(j); return [p, j]; };
    add(new THREE.CylinderGeometry(0.25, 0.16, 0.56, 10), cl, 0, 1.1, 0, G);
    add(new THREE.SphereGeometry(0.155, 14, 10), skin, 0, 1.55, 0, G);
    for (const sx of [-0.055, 0.055]) add(new THREE.SphereGeometry(0.022, 6, 5), eye, sx, 1.57, 0.14, G);
    add(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 12), std(0x2a2622, 0.8), 0, 1.68, 0, G);
    const L = [], Ar = [];
    for (const sx of [-1, 1]) {
      const [hip, knee] = limb(G, sx * 0.09, 0.84, 0.4, 0.075, pa); add(new THREE.CylinderGeometry(0.065, 0.055, 0.4, 8), pa, 0, -0.2, 0, knee); add(new THREE.BoxGeometry(0.1, 0.06, 0.2), std(0x1a1a1a, 0.7), 0, -0.42, 0.05, knee); L.push([hip, knee]);
      const [sh, el] = limb(G, sx * 0.27, 1.34, 0.3, 0.06, cl); add(new THREE.CylinderGeometry(0.05, 0.045, 0.28, 8), cl, 0, -0.14, 0, el); add(new THREE.SphereGeometry(0.05, 8, 6), skin, 0, -0.3, 0, el); Ar.push([sh, el]);
    }
    const pose = (p, ph = 0) => {
      if (p === "sit") { L.forEach(([h, k]) => { h.rotation.x = -1.45; k.rotation.x = 1.4; }); Ar.forEach(([a, e], j) => { a.rotation.x = -0.9 - 0.45 * Math.sin(ph); e.rotation.x = -0.6; a.rotation.z = (j ? -1 : 1) * 0.15; }); }
      else if (p === "point") { L.forEach(([h, k]) => { h.rotation.x = -0.12; k.rotation.x = 0.22; }); Ar[0][0].rotation.x = -0.3; Ar[0][1].rotation.x = -0.4; Ar[1][0].rotation.x = -1.4; Ar[1][1].rotation.x = -0.2; }
      else if (p === "key") { L.forEach(([h, k]) => { h.rotation.x = -1.45; k.rotation.x = 1.4; }); Ar.forEach(([a, e]) => { a.rotation.x = -0.75; e.rotation.x = -0.9 - (p === "key" ? 0.2 * Math.max(0, Math.sin(ph)) : 0); }); }
      else { L.forEach(([h, k], j) => { h.rotation.x = -0.1 + (j ? 0.05 : -0.05); k.rotation.x = 0.2; }); Ar.forEach(([a, e], j) => { a.rotation.x = 0.1; a.rotation.z = (j ? -1 : 1) * 0.12; e.rotation.x = -0.35; }); }
    };
    pose("stand");
    return { G, pose };
  }

  // ================= SHIPS =================
  function hullShape(L, B) {
    const s = new THREE.Shape();
    s.moveTo(-L / 2 + 0.4, -B / 2); s.lineTo(L / 2 - 1.6, -B / 2); s.quadraticCurveTo(L / 2 - 0.3, -B / 2 + 0.05, L / 2, 0); s.quadraticCurveTo(L / 2 - 0.3, B / 2 - 0.05, L / 2 - 1.6, B / 2); s.lineTo(-L / 2 + 0.4, B / 2); s.quadraticCurveTo(-L / 2, B / 2, -L / 2, 0); s.quadraticCurveTo(-L / 2, -B / 2, -L / 2 + 0.4, -B / 2);
    return s;
  }
  function ship({ L = 9, B = 1.7, hullC, bootC = 0x7a2a22, supC = 0xd8d0bc, funC = 0x1f1f1f, band = null, clip = null, sideText = null }) {
    const G = new THREE.Group(); scene.add(G);
    const HH = 1.5, y0 = -0.5;
    const hg = new THREE.ExtrudeGeometry(hullShape(L, B), { depth: HH, bevelEnabled: false, curveSegments: 10 }); hg.rotateX(-Math.PI / 2); hg.translate(0, y0, 0);
    const hm = std(hullC, 0.55, 0.15, { side: THREE.DoubleSide });
    if (clip) { hm.clippingPlanes = clip; hm.clipIntersection = true; hm.clipShadows = true; }
    add(hg, hm, 0, 0, 0, G);
    const bg = new THREE.ExtrudeGeometry(hullShape(L * 1.002, B * 1.01), { depth: 0.32, bevelEnabled: false, curveSegments: 10 }); bg.rotateX(-Math.PI / 2); bg.translate(0, -0.12, 0);
    const bm = std(bootC, 0.6, 0.1, { side: THREE.DoubleSide }); if (clip) { bm.clippingPlanes = clip; bm.clipIntersection = true; }
    add(bg, bm, 0, 0, 0, G);
    const deckY = y0 + HH;
    const dg = new THREE.ShapeGeometry(hullShape(L * 0.985, B * 0.95)); dg.rotateX(-Math.PI / 2);
    const dm = std(0x8a6e52, 0.85, 0, { side: THREE.DoubleSide }); if (clip) { dm.clippingPlanes = clip; dm.clipIntersection = true; }
    add(dg, dm, 0, deckY - 0.02, 0, G);
    // superstructure, funnel, masts
    const sm = std(supC, 0.6);
    add(new THREE.BoxGeometry(1.5, 0.8, B * 0.78), sm, -1.4, deckY + 0.4, 0, G);
    add(new THREE.BoxGeometry(1.1, 0.45, B * 0.66), sm, -1.4, deckY + 1.02, 0, G);
    for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(0.16, 0.14, 0.02), std(0x1c242c, 0.2, 0.4), -1.85 + k * 0.3, deckY + 0.55, B * 0.39 + 0.012, G);
    add(new THREE.CylinderGeometry(0.26, 0.3, 1.5, 14), std(funC, 0.6), -2.6, deckY + 1.0, 0, G);
    if (band) add(new THREE.CylinderGeometry(0.265, 0.285, 0.25, 14), std(band, 0.6), -2.6, deckY + 1.45, 0, G);
    const mm = std(0x3a3028, 0.8);
    for (const x of [2.6, -3.6]) add(new THREE.CylinderGeometry(0.05, 0.07, 3.2, 6), mm, x, deckY + 1.6, 0, G);
    add(new THREE.BoxGeometry(L * 0.8, 0.02, 0.02), mm, -0.5, deckY + 3.0, 0, G).rotation.z = -0.08;
    if (sideText) for (const sz of [1, -1]) {
      const T = canvasTex(1024, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.font = `900 92px ${SANS}`; g.fillStyle = "#F4EFE4"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(sideText, w / 2, h / 2 + 4); });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.7), new THREE.MeshStandardMaterial({ map: T, transparent: true, roughness: 0.6 })); p.position.set(0.2, y0 + 0.95, sz * (B / 2 + 0.012)); if (sz < 0) p.rotation.y = Math.PI; G.add(p);
    }
    return { G, deckY, B, L };
  }
  // Mont-Blanc: cutaway hold via 3 intersecting clip planes (x0 < x < x1, z > zcut in ship space → removed)
  const clipLocal = [new THREE.Plane(new V3(-1, 0, 0), 0.4), new THREE.Plane(new V3(1, 0, 0), -3.7), new THREE.Plane(new V3(0, 0, -1), 0)];
  const clipW = clipLocal.map((p) => p.clone());
  const MB = ship({ hullC: 0x2c2724, bootC: 0x8a2c22, supC: 0xd6cdb8, funC: 0x1d1d1d, band: 0x2a4f8a, clip: clipW });
  const IMO = ship({ hullC: 0x56636e, bootC: 0x6b2a24, supC: 0xd8d0bc, funC: 0x232323, band: 0xb02c26, sideText: "BANTUAN BELGIA" });
  // hold interior + cargo
  const HOLD = new THREE.Group(); MB.G.add(HOLD);
  {
    const inner = std(0x4a3a2c, 0.9, 0, { side: THREE.BackSide });
    add(new THREE.BoxGeometry(3.3, 1.35, 1.5), inner, 2.05, 0.17, -0.02, HOLD).castShadow = false;
    const crate = (txt, col, tc) => canvasTex(256, 256, (g, w) => { g.fillStyle = col; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 32) { g.fillStyle = "rgba(0,0,0,.16)"; g.fillRect(0, y, w, 3); } g.strokeStyle = "rgba(40,24,10,.6)"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, w - 10); g.font = `900 ${txt.length > 4 ? 64 : 110}px ${SANS}`; g.fillStyle = tc; g.textAlign = "center"; g.textBaseline = "middle"; if (txt.includes(" ")) { const [a, b] = txt.split(" "); g.fillText(a, w / 2, w * 0.38); g.fillText(b, w / 2, w * 0.66); } else g.fillText(txt, w / 2, w / 2 + 6); });
    const tntM = std(0xffffff, 0.8, 0, { map: crate("TNT", "#b98a52", "#9c1f16") }), picM = std(0xffffff, 0.8, 0, { map: crate("ASAM PIKRAT", "#c9b06a", "#2d2a20") });
    for (let ix = 0; ix < 3; ix++) for (let iy = 0; iy < 2; iy++) for (let iz = 0; iz < 2; iz++) {
      const m = ix < 1 || (ix === 1 && iz === 0) ? tntM : picM;
      add(new THREE.BoxGeometry(0.95, 0.58, 0.6), ix < 2 ? (ix === 0 ? tntM : picM) : picM, 0.95 + ix * 1.05, -0.2 + iy * 0.6, -0.35 + iz * 0.68, HOLD);
    }
  }
  const HOLDRIM = new THREE.Group(); MB.G.add(HOLDRIM);
  { const rm = new THREE.MeshBasicMaterial({ color: 0xff7a3c, toneMapped: true }); for (const [w, h, x, y] of [[3.3, 0.06, 2.05, 1.0], [3.3, 0.06, 2.05, -0.5], [0.06, 1.5, 0.4, 0.25], [0.06, 1.5, 3.7, 0.25]]) add(new THREE.BoxGeometry(w, h, 0.06), rm, x, y, 0.86, HOLDRIM).castShadow = false; }
  // benzol drums on deck (far half of the forward deck + aft)
  const DRUMS = [];
  {
    const dT = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#b5642a"; g.fillRect(0, 0, w, h); for (const y of [18, h - 22]) { g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(0, y, w, 5); } g.font = `800 34px ${SANS}`; g.fillStyle = "#1e1208"; g.textAlign = "center"; g.fillText("BENSOL", w / 2, h / 2 + 12); });
    const dm = std(0xffffff, 0.45, 0.35, { map: dT });
    let k = 0;
    for (let ix = 0; ix < 5; ix++) for (let iz = 0; iz < 2; iz++) { const m = add(new THREE.CylinderGeometry(0.17, 0.17, 0.42, 14), dm, 0.8 + ix * 0.55, MB.deckY + 0.21, -0.62 + iz * 0.38, MB.G); m.rotation.y = k * 0.7; DRUMS.push(m); k++; }
    for (let ix = 0; ix < 3; ix++) for (let iz = 0; iz < 3; iz++) { const m = add(new THREE.CylinderGeometry(0.17, 0.17, 0.42, 14), dm, -3.95 + ix * 0.4, MB.deckY + 0.21, -0.45 + iz * 0.42, MB.G); DRUMS.push(m); }
  }
  const SPLIT = add(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 14, 1, true, 0, 4.2), std(0xb5642a, 0.5, 0.3, { side: THREE.DoubleSide }), 3.0, MB.deckY + 0.1, -0.24, MB.G); SPLIT.rotation.z = Math.PI / 2;
  const SPILL = add(new THREE.CircleGeometry(0.7, 20), std(0x2a1c10, 0.15, 0.2, { transparent: true, opacity: 0 }), 3.0, MB.deckY + 0.015, -0.2, MB.G); SPILL.rotation.x = -Math.PI / 2;

  // convoy at the harbour mouth (s2)
  const CONVOY = [];
  {
    const q = mulberry(41);
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(); scene.add(g); const L = 3 + q() * 1.2; const hg = new THREE.ExtrudeGeometry(hullShape(L, 0.7), { depth: 0.6, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); hg.translate(0, -0.25, 0); add(hg, std([0x4a5560, 0x5a5048, 0x3a4450][i % 3], 0.6), 0, 0, 0, g); add(new THREE.BoxGeometry(0.6, 0.4, 0.5), std(0xcfc6b2, 0.6), -0.3, 0.55, 0, g); add(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8), std(0x222222, 0.6), -0.8, 0.7, 0, g); CONVOY.push({ g, x: -24 - (i % 3) * 4.2 - q() * 1.5, z: -5 + Math.floor(i / 3) * 5 + q() * 1.2 }); }
  }
  // route arrow to Europe (dashed boxes on the water toward -x)
  const ROUTE = new THREE.Group(); scene.add(ROUTE);
  { const rm = new THREE.MeshBasicMaterial({ color: 0x3fc6d4, transparent: true, opacity: 0.9, toneMapped: false }); for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(0.9, 0.06, 0.28), rm, -26 - i * 1.2, 0.12, 2.2, ROUTE).castShadow = false; const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 3), rm); tip.rotation.set(0, 0, Math.PI / 2); tip.position.set(-37.2, 0.15, 2.2); ROUTE.add(tip); }
  // wrong-lane arrow (s3)
  const LANE = new THREE.Group(); scene.add(LANE);
  { const okM = new THREE.MeshBasicMaterial({ color: 0x3fc6d4, transparent: true, toneMapped: false }), bad = new THREE.MeshBasicMaterial({ color: 0xe5533a, transparent: true, toneMapped: false }); for (let i = 0; i < 10; i++) { add(new THREE.BoxGeometry(0.8, 0.05, 0.2), okM, 18 - i * 2, 0.1, -2.6, LANE).castShadow = false; add(new THREE.BoxGeometry(0.8, 0.05, 0.2), bad, 18 - i * 2, 0.1, 3.6, LANE).castShadow = false; } }
  const laneMats = [LANE.children[0].material, LANE.children[1].material];

  // lifeboat (s5) with rowing crew
  const BOAT = new THREE.Group(); scene.add(BOAT);
  const CREW = [];
  { const bg = new THREE.ExtrudeGeometry(hullShape(1.9, 0.6), { depth: 0.3, bevelEnabled: false }); bg.rotateX(-Math.PI / 2); bg.translate(0, -0.1, 0); add(bg, std(0x8a6a4a, 0.8, 0, { side: THREE.DoubleSide }), 0, 0, 0, BOAT); for (let i = 0; i < 4; i++) { const p = person(i + 1, 0.28); p.G.position.set(-0.6 + i * 0.4, -0.05, 0); p.G.rotation.y = -Math.PI / 2; p.pose("sit"); BOAT.add(p.G); CREW.push(p); } }
  // watchers on the Halifax shore street
  const WATCH = [];
  for (let i = 0; i < 9; i++) { const p = person(i, 0.3); const x = -6 + i * 1.5 + (i % 2) * 0.3, z = railZ(x) - 0.8 - (i % 3) * 0.35; p.G.position.set(x, landH(x, z) + 0.02, z); p.G.rotation.y = 0.1 * Math.sin(i); if (i % 4 === 1) p.pose("point"); scene.add(p.G); WATCH.push(p); }
  // Coleman (generic figure at the key inside the open post)
  const COL = person(4, 0.3); COL.pose("key"); COL.G.position.set(0.2, 0.12, 0.62); POST.add(COL.G);
  // telegraph waves
  const TW = []; { const m = new THREE.MeshBasicMaterial({ color: 0x3fc6d4, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }); for (let i = 0; i < 5; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 32, 1.4), m.clone()); w.renderOrder = 3; scene.add(w); TW.push(w); } }

  // trains
  function train(cars, carC, text) {
    const G = new THREE.Group(); scene.add(G);
    const parts = [];
    const loco = new THREE.Group(); G.add(loco); parts.push(loco);
    add(new THREE.CylinderGeometry(0.32, 0.32, 1.6, 14), std(0x1e1e20, 0.5, 0.4), 0, 0.55, 0, loco).rotation.z = Math.PI / 2;
    add(new THREE.BoxGeometry(0.7, 0.75, 0.7), std(0x2a2a2c, 0.6, 0.3), 0.85, 0.65, 0, loco);
    add(new THREE.CylinderGeometry(0.1, 0.14, 0.4, 8), std(0x1a1a1a, 0.6), -0.55, 1.0, 0, loco);
    add(new THREE.BoxGeometry(1.9, 0.18, 0.6), std(0x3a1e18, 0.7), 0.1, 0.18, 0, loco);
    const T = text ? canvasTex(512, 96, (g, w, h) => { g.fillStyle = "#" + new THREE.Color(carC).getHexString(); g.fillRect(0, 0, w, h); g.font = `900 52px ${SANS}`; g.fillStyle = "#F4EFE4"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2 + 3); }) : null;
    for (let i = 0; i < cars; i++) {
      const c = new THREE.Group(); G.add(c); parts.push(c);
      add(new THREE.BoxGeometry(1.9, 0.75, 0.62), std(carC, 0.7), 0, 0.6, 0, c);
      add(new THREE.BoxGeometry(2.0, 0.08, 0.7), std(0x2a2422, 0.7), 0, 1.0, 0, c);
      for (let k = 0; k < 5; k++) add(new THREE.BoxGeometry(0.2, 0.2, 0.02), std(0xe8d4a0, 0.4, 0, { emissive: 0xffc070, emissiveIntensity: 0.15 }), -0.7 + k * 0.35, 0.72, 0.315, c);
      if (T) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.3), new THREE.MeshStandardMaterial({ map: T, roughness: 0.7 })); p.position.set(0, 0.4, 0.315); c.add(p); }
    }
    return { G, parts, place(x) { parts.forEach((p, i) => { onRail(p, x + i * 2.1); p.position.sub(G.position); }); } };
  }
  const TRAIN = train(3, 0x6a2e24, null);
  const RELIEF = train(3, 0x2c4a3a, "BANTUAN · BOSTON");

  // tree ship (s8): crate + Christmas tree
  const TSHIP = ship({ L: 7, B: 1.5, hullC: 0x34404a, bootC: 0x7a2a22, supC: 0xd6cdb8, funC: 0x222222, band: 0x2f6b4a });
  const TREE = new THREE.Group(); TSHIP.G.add(TREE); TREE.position.set(1.6, TSHIP.deckY, 0);
  {
    const cT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#a57c4e"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 42) { g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, y, w, 4); } g.strokeStyle = "rgba(50,30,10,.7)"; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.font = `900 64px ${SANS}`; g.fillStyle = "#2a1a0c"; g.textAlign = "center"; g.fillText("HALIFAX → BOSTON", w / 2, 108); g.font = `700 36px ${MONO}`; g.fillText("TERIMA KASIH · AUDIRA", w / 2, 182); });
    add(new THREE.BoxGeometry(1.8, 0.9, 1.2), std(0xffffff, 0.85, 0, { map: cT }), 0, 0.45, 0, TREE);
    add(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), std(0x4a3020, 0.9), 0, 1.1, 0, TREE);
    const gm = std(0x2c5a3a, 0.85);
    [[0.9, 1.0, 1.55], [0.72, 0.9, 2.15], [0.52, 0.8, 2.7], [0.3, 0.6, 3.15]].forEach(([rr, hh, y]) => add(new THREE.ConeGeometry(rr, hh, 14), gm, 0, y, 0, TREE));
    add(new THREE.OctahedronGeometry(0.16), std(0xe8b84a, 0.3, 0.7, { emissive: 0xffb040, emissiveIntensity: 0.4 }), 0, 3.55, 0, TREE);
    const lm = new THREE.MeshStandardMaterial({ color: 0xffd28a, emissive: 0xffb050, emissiveIntensity: 0.9 }), lr = new THREE.MeshStandardMaterial({ color: 0xff6a5a, emissive: 0xff4a3a, emissiveIntensity: 0.8 });
    for (let i = 0; i < 22; i++) { const y = 1.4 + (i / 22) * 1.9, rr = 0.85 * (1 - (y - 1.3) / 2.3) + 0.05, a = i * 2.4; add(new THREE.SphereGeometry(0.045, 6, 5), i % 3 ? lm : lr, Math.cos(a) * rr, y, Math.sin(a) * rr, TREE).castShadow = false; }
  }
  const treeSnow = []; TREE.children.filter((c) => c.geometry && c.geometry.type === "ConeGeometry").forEach((c) => { const s = c.clone(); s.material = std(0xe6ebef, 0.8); s.scale.set(0.98, 0.35, 0.98); s.position.y += c.geometry.parameters.height * 0.3; TREE.add(s); treeSnow.push(s); });

  // ================= FIRE / EXPLOSION =================
  const FLAME = pts(scene, 500, { color: 0xff8a2a, size: 1.0, add: true, opacity: 0.42 });
  const SPARK = pts(scene, 160, { color: 0xffd080, size: 0.16, add: true, opacity: 0.9 });
  const SNOW = pts(scene, 2200, { color: 0xdfe6ec, size: 0.3, add: false, opacity: 0.9 });
  const SHARD = pts(scene, 500, { color: 0xb8d8e8, size: 0.14, add: false, opacity: 0.95 });
  const DEBRIS = pts(scene, 500, { color: 0x3a2e26, size: 0.3, add: false, opacity: 1 });
  const SPRAY = pts(scene, 700, { color: 0xcfe2ea, size: 0.3, add: false, opacity: 0.8 });
  const smokeM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, transparent: true, opacity: 1 });
  const DECK_SMOKE = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), smokeM, 40); DECK_SMOKE.castShadow = false; scene.add(DECK_SMOKE);
  const SN = 130, SMOKE = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), smokeM.clone(), SN); SMOKE.castShadow = false; scene.add(SMOKE);
  const fireballM = new THREE.MeshStandardMaterial({ color: 0x5a2a10, emissive: 0xff7a24, emissiveIntensity: 1.2, roughness: 1 });
  const FB = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), fireballM); scene.add(FB);
  const ringM = basic({ color: 0xffb070, side: THREE.DoubleSide });
  const PR = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 128), ringM.clone()); m.rotation.x = -Math.PI / 2; m.renderOrder = 4; scene.add(m); return m; });
  const R8 = new THREE.Group(); scene.add(R8);
  { const m = new THREE.MeshBasicMaterial({ color: 0xe5533a, transparent: true, toneMapped: false, depthWrite: false }); for (let i = 0; i < 72; i++) { if (i % 2) continue; const a = (i / 72) * Math.PI * 2, x = E.x + Math.cos(a) * R800, z = E.z + Math.sin(a) * R800; const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.35), m); b.position.set(x, Math.max(0, landH(x, z)) + 0.35, z); b.rotation.y = -a + Math.PI / 2; b.renderOrder = 5; R8.add(b); } }
  const r8M = R8.children[0].material;
  const SC = [new THREE.Color(0x7a4a32), new THREE.Color(0x6f6a64), new THREE.Color(0x8e8a84), new THREE.Color(0xa29d96)];
  const dmy = new THREE.Object3D();

  // labels
  const L = {
    hal: plate("HALIFAX"), dart: plate("DARTMOUTH"), nar: plate("THE NARROWS", { font: MONO, weight: 700 }), bed: plate("BEDFORD BASIN", { font: MONO, weight: 700 }),
    pier: plate("PIER 6", { bd: "#E07B2E" }), rich: plate("RICHMOND", { font: MONO, weight: 700 }), eur: plate("KONVOI → EROPA", { bd: "#3FC6D4" }),
    mb: plate("MONT-BLANC · PRANCIS", { bd: "#E5533A" }), imo: plate("IMO · NORWEGIA", { bd: "#D9B23A" }),
    tnt: plate("TNT", { bd: "#E5533A" }), pik: plate("ASAM PIKRAT", { bd: "#D9B23A" }), ben: plate("TONG BENSOL", { bd: "#E07B2E" }),
    slow: plate("< KECEPATAN JALAN KAKI", { bd: "#D9B23A" }), post: plate("POS TELEGRAF KERETA", { bd: "#3FC6D4" }), trn: plate("KERETA PENUMPANG", { bd: "#3FC6D4" }),
    r8: plate("RADIUS 800 m", { bd: "#E5533A", font: MONO, weight: 700 }), rel: plate("BANTUAN DARI BOSTON", { bd: "#3FC6D4" }), wrong: plate("SISI YANG SALAH", { bd: "#E5533A" }),
  };

  // ================= TIME MAPS =================
  const tE1 = A("s1:ledakan"), tE2 = A("s6:meledak"), tHit = A("s4:bertabrakan");
  const hookEnd = K.s2 - 0.12;
  const exAge = (t) => (t < hookEnd ? t - tE1 : t - tE2);
  // Mont-Blanc pose
  const C_MB = [-6.5, 3.0, 0], C_IMO = [0.95, 5.96, Math.PI - 0.5];
  const mbX = track([[K.s3 - 0.1, -31], [A("s3:Muatannya"), -23], [A("s3:dek"), -16.5], [A("s3:Dari"), -14], [tHit, -6.5]]);
  const mbDrift = track([[A("s4:pecah"), 0], [A("s5:Ratusan"), 0.55], [A("s5:Petugas"), 0.9], [K.s6, 1]]);
  function mbPose(t) {
    if (t < hookEnd) { // hook: bump, then time-lapse drift to the pier
      if (t < A("s1:pelan")) return [C_MB[0] - (A("s1:pelan") - t) * 0.9, C_MB[1], 0, 1];
      const u = smooth((t - A("s1:pelan") - 0.5) / (tE1 - A("s1:pelan") - 0.9));
      return [lerp(C_MB[0], E.x, u), lerp(C_MB[1], E.z, u), 0.25 * u, t < tE1 ? 1 : 0];
    }
    if (t < K.s3 - 0.15 || t >= tE2) return [0, 0, 0, 0];
    if (t < tHit) return [mbX(t)[0], C_MB[1], 0, 1];
    const u = smooth(mbDrift(t)[0]);
    return [lerp(C_MB[0], E.x, u), lerp(C_MB[1], E.z, u), 0.25 * u, 1];
  }
  const imoX = track([[A("s3:Dari"), 28], [A("s3:melaju"), 20], [A("s3:salah"), 9], [tHit, C_IMO[0]]]);
  function imoPose(t) {
    if (t < hookEnd) {
      const tp = A("s1:pelan");
      if (t < tp) { const d = (tp - t) * 1.0; return [C_IMO[0] + Math.cos(0.5) * d, C_IMO[1] + Math.sin(0.5) * d, C_IMO[2], 0]; }
      const u = smooth((t - tp) / 2.5); const base = [C_IMO[0] + 2.2 * u, C_IMO[1] - 0.1 * u, C_IMO[2] + 0.1 * u, 0];
      if (t > tE1) { const v = smooth((t - tE1) / 1.2); return [base[0] + 3 * v, base[1] + 1.2 * v, base[2], 0.1 * v]; }
      return base;
    }
    if (t < A("s3:Dari")) return [28, -1.5, Math.PI, 0];
    if (t < tHit) { const x = imoX(t)[0], u = smooth((x - 28) / (C_IMO[0] - 28)); return [x, lerp(-1.5, C_IMO[1], smooth(u * 1.6)), lerp(Math.PI, C_IMO[2], smooth((u - 0.5) * 2)), 0]; }
    if (t < tE2) { const u = smooth((t - tHit - 1) / 6); return [C_IMO[0] + 2.2 * u, C_IMO[1] - 0.1 * u, C_IMO[2] + 0.1 * u, 0]; }
    const v = smooth((t - tE2) / 1.5); return [C_IMO[0] + 2.2 + 3 * v, C_IMO[1] - 0.1 + 1.2 * v, C_IMO[2] + 0.1, 0.12 * v];
  }
  const fireK = (t) => (t < hookEnd ? smooth((t - A("s1:pelan") - 0.6) / 2.5) : t < A("s4:percikan") ? 0 : smooth((t - A("s4:percikan")) / 3.5) * (0.6 + 0.4 * smooth((t - K.s5) / 8)));

  // ================= CAMERA STATIONS =================
  const S = {
    hook: track([[0, -14, 12, 16, -2.5, -0.8, 3.5], [A("s1:pelabuhan"), -9, 14, 22, -0.5, -0.6, 1], [tE1 - 0.3, 6, 16, 44, 1, 3, -3], [tE1 + 1.3, 20, 24, 72, 2, 19, -4], [hookEnd, 22, 25, 76, 2, 20, -4]]),
    s2: track([[K.s2 - 0.12, -6, 64, 78, 0, 0, -3], [A("s2:Desember"), 8, 54, 66, 0, 0, -4], [A("s2:Perang"), -10, 32, 44, -22, 0, -1], [A("s2:kapal"), -20, 20, 32, -28, 0, 0], [K.s3, -24, 14, 26, -28, 1, 1.5]]),
    s4: track([[K.s4 - 0.12, -12, 10, 21, -3, -0.5, 3], [tHit, -9, 7, 16, -3, -0.3, 3.4], [A("s4:lambat"), -7, 5.5, 13.5, -3, -0.2, 3.5], [A("s4:Tapi"), -9.5, 6, 11, -4.2, 0.3, 2.6], [A("s4:api"), -10, 9, 17, -3, 2.3, 1.5], [K.s5, -10, 10, 20, -2, 2.4, 1]]),
    s5: track([[K.s5 - 0.12, -10, 10, 20, -2, 2.4, 1], [A("s5:sekoci"), -8, 6.5, 19, -2, 0.6, 5.5], [A("s5:Ratusan"), 6, 6, 11, -0.5, 2, -8], [A("s5:menonton"), 7, 5.5, 8, 0, 2, -9.5], [A("s5:Petugas"), -2.2, 3.8, -5, -4, 0.4, -11], [A("s5:telegraf"), 1, 5.5, -2.5, 1, 0.6, -11], [A("s5:penumpang"), 14, 8.5, 0, 22, -0.8, -12], [K.s6, 15, 9, 1, 22, -0.8, -12]]),
    s6: track([[K.s6 - 0.12, 10, 18, 44, 2, 10, -4], [tE2, 14, 21, 56, 2, 15, -4], [tE2 + 1.2, 20, 25, 72, 2, 19, -4], [A("s6:Hampir"), 16, 58, 50, 2, 0, -6], [A("s6:meter"), 8, 70, 38, 2, 0, -7], [A("s6:Gelombang"), -16, 13, 30, -1, -0.5, 11], [A("s6:kaca"), -12, 8, 2, -7, 0, -12], [K.s7, -12, 8.5, 3, -7, 0, -12]]),
    s7: track([[K.s7 - 0.12, -22, 40, 58, 0, 0, -6], [A("s7:Vince"), -2.2, 3.8, -5, -4, 0.4, -11], [A("s7:Keesokan"), 8, 22, 32, 6, 1, -8], [A("s7:bantuan"), 14, 10, 3, 22, -1.2, -13], [A("s7:Boston"), 12, 9.5, 2, 19, -1.2, -12], [K.s8, 11, 9.5, 2, 18, -1.2, -12]]),
  };
  const tsX = track([[K.s8 - 0.2, 8], [A("s8:Boston"), -2], [A("s8:Menurut"), -12], [K.dur, -20]]);
  const s3rel = track([[K.s3 - 0.12, 4, 5.5, 13, 1, 1, 0], [A("s3:Mont-Blanc"), 3, 4.5, 11.5, 1, 1, 0], [A("s3:Muatannya"), 2.2, 3.4, 9.6, 2, -0.6, 0], [A("s3:pikrat"), 1.8, 3.6, 9.8, 2, -0.5, 0], [A("s3:dek"), 0.5, 5, 10, 1.2, 0.2, 0]]);
  const s3abs = (() => { const t0 = A("s3:Dari"), r0 = s3rel(t0), x0 = mbX(t0)[0]; return track([[t0, x0 + r0[0], r0[1], C_MB[1] + r0[2], x0 + r0[3], r0[4], C_MB[1] + r0[5]], [A("s3:Imo"), 0, 16, 22, 16, -0.5, 0], [A("s3:salah"), -6, 17, 23, 3, -0.5, 1.5], [K.s4, -8, 11, 22, -2, 1, 2.5]]); })();
  const s8 = (t) => { const x = tsX(t)[0]; const u = smooth((t - A("s8:Menurut") + 0.6) / 2.4); const tx = x - 1.6, near = [tx + 2.5, 4.4, 11.5, tx, 1.6, 1], far = [x + 6, 30, 52, x - 2, 2, -3]; return near.map((v, i) => lerp(v, far[i], u)); };
  const look = new V3();
  const setCam = (c) => { cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(look); };
  const cWarm = new THREE.Color(0xffe4c4), cCold = new THREE.Color(0xcad6e6), cEve = new THREE.Color(0xffb878);

  // ================= DRAW =================
  return function draw(t) {
    for (const l of labels) l.visible = false;
    const hook = t < hookEnd;
    const a = exAge(t);
    const cold = t < K.s8 ? win(t, K.s7 - 0.3, K.s8 + 1, 2, 2) : 0, eve = smooth((t - K.s8) / 3);
    sun.color.copy(cWarm).lerp(cCold, cold).lerp(cEve, eve);
    sun.intensity = 2.5 - 1.1 * cold - 0.9 * eve;
    hemi.intensity = 1.0 - 0.15 * cold - 0.3 * eve;
    sun.position.set(-40 + 60 * eve, 70 - 35 * eve, 55);

    // ---------- ships ----------
    const mp = mbPose(t);
    MB.G.visible = mp[3] > 0.5;
    MB.G.position.set(mp[0], 0.04 * Math.sin(t * 1.1), mp[1]); MB.G.rotation.set(0, mp[2], 0.012 * Math.sin(t * 0.8));
    const bump = (tt) => { const d = t - tt; return d > 0 && d < 0.8 ? Math.sin(d * 18) * 0.06 * (1 - d / 0.8) : 0; };
    MB.G.position.x += hook ? bump(A("s1:pelan")) : bump(tHit);
    // cutaway: opens in s3 on "Muatannya", stays through the film
    const cut = hook ? 1 : t < K.s3 ? 0 : smooth((t - A("s3:Muatannya") + 0.5) / 1.0);
    clipLocal[2].constant = lerp(1.2, 0.05, cut); // n=(0,0,-1), constant=zcut: with clipIntersection removes x0<x<x1 AND z>zcut
    MB.G.updateMatrixWorld(true);
    clipLocal.forEach((p, i) => { clipW[i].copy(p).applyMatrix4(MB.G.matrixWorld); });
    // three removes fragments when ALL planes have them on the negative side with clipIntersection
    HOLD.visible = HOLDRIM.visible = cut > 0.02; HOLDRIM.children.forEach((c) => (c.material.opacity = 1));
    const ip = imoPose(t);
    IMO.G.visible = hook || t > K.s2 - 0.2;
    IMO.G.position.set(ip[0], 0.04 * Math.sin(t * 1.3 + 1) + (ip[3] ? 0.35 * ip[3] / 0.12 : 0), ip[1]); IMO.G.rotation.set(0, ip[2], ip[3]);
    IMO.G.position.x += hook ? -bump(A("s1:pelan")) * 0.5 : -bump(tHit) * 0.5;
    // spill + split drum
    const spl = hook ? smooth((t - A("s1:pelan") - 0.3) / 1) : t < A("s4:pecah") - 0.1 ? 0 : smooth((t - A("s4:pecah") + 0.1) / 1.2);
    SPILL.material.opacity = 0.85 * spl; SPILL.scale.setScalar(0.3 + 0.9 * spl); SPLIT.visible = spl > 0.01;
    // convoy + route
    const cv = !hook && t < K.s4;
    CONVOY.forEach((c, i) => { c.g.visible = cv; c.g.position.set(c.x - (t > A("s2:menyeberang") ? (t - A("s2:menyeberang")) * 0.6 : 0), 0.03 * Math.sin(t + i), c.z); c.g.rotation.y = Math.PI; });
    ROUTE.visible = !hook && t > A("s2:menyeberang") - 0.4 && t < K.s3 + 1;
    ROUTE.children.forEach((c, i) => { c.material.opacity = 0.9 * clamp01((t - A("s2:menyeberang") + 0.4 - i * 0.06) / 0.3); });
    LANE.visible = !hook && t > A("s3:terdesak") - 0.3 && t < K.s4 + 0.5;
    laneMats.forEach((m) => (m.opacity = 0.9 * win(t, A("s3:terdesak") - 0.3, K.s4 + 0.3, 0.4, 0.4)));

    // ---------- fire on deck ----------
    const fk = mp[3] > 0.5 ? fireK(t) : 0;
    fireL.intensity = fk * 7 * (0.85 + 0.15 * Math.sin(t * 13)); fireL.position.set(mp[0] + 2, 2.2, mp[1]);
    {
      const c = Math.cos(mp[2]), s = Math.sin(mp[2]);
      const wp = (lx, ly, lz) => [mp[0] + lx * c + lz * s, ly, mp[1] - lx * s + lz * c];
      for (let i = 0; i < 500; i++) {
        if (fk < 0.01 || i > 500 * fk) { FLAME.pos[i * 3 + 1] = -60; continue; }
        const ph = (t * 1.6 + hsh(i, 1)) % 1, lx = 0.5 + hsh(i, 2) * 3.4 - (i % 5 === 0 ? 4.5 : 0), lz = (hsh(i, 3) - 0.5) * 1.2;
        const p = wp(lx + Math.sin(t * 3 + i) * 0.1, MB.deckY + 0.2 + ph * (1.2 + 1.6 * fk), lz);
        FLAME.pos[i * 3] = p[0]; FLAME.pos[i * 3 + 1] = p[1]; FLAME.pos[i * 3 + 2] = p[2];
        const k = Math.sin(Math.PI * ph) * (1 - ph * 0.5); FLAME.col[i * 3] = k; FLAME.col[i * 3 + 1] = k * (0.42 - 0.25 * ph); FLAME.col[i * 3 + 2] = k * 0.08;
      }
      FLAME.commit();
      const spk = hook ? win(t, A("s1:pelan") + 0.2, A("s1:pelan") + 2, 0.2, 0.6) : win(t, A("s4:percikan") - 0.2, A("s4:api") + 0.6, 0.2, 0.6);
      for (let i = 0; i < 160; i++) {
        if (spk < 0.01 || mp[3] < 0.5) { SPARK.pos[i * 3 + 1] = -60; continue; }
        const ph = (t * 2.2 + hsh(i, 1)) % 1, p = wp(3.0 + (hsh(i, 2) - 0.5) * ph * 2.4, MB.deckY + 0.2 + ph * 1.4 - ph * ph * 1.6, -0.2 + (hsh(i, 3) - 0.5) * ph * 2.4);
        SPARK.pos[i * 3] = p[0]; SPARK.pos[i * 3 + 1] = p[1]; SPARK.pos[i * 3 + 2] = p[2];
        const k = spk * (1 - ph); SPARK.col[i * 3] = k; SPARK.col[i * 3 + 1] = k * 0.8; SPARK.col[i * 3 + 2] = k * 0.45;
      }
      SPARK.commit();
      for (let i = 0; i < 40; i++) {
        if (fk < 0.02) { dmy.scale.setScalar(0.0001); dmy.position.set(0, -60, 0); dmy.updateMatrix(); DECK_SMOKE.setMatrixAt(i, dmy.matrix); continue; }
        const ph = (t * 0.22 + i / 40) % 1, p = wp(1 + hsh(i, 2) * 2.6, MB.deckY + 1 + ph * (5 + 6 * fk), (hsh(i, 3) - 0.5) * 0.8);
        dmy.position.set(p[0] - ph * 3, p[1], p[2] - ph * 1.5); dmy.scale.setScalar((0.5 + ph * 2.4) * Math.min(1, fk * 1.5) * Math.sin(Math.PI * Math.min(1, ph * 1.3 + 0.05))); dmy.rotation.set(i, i * 2, 0); dmy.updateMatrix(); DECK_SMOKE.setMatrixAt(i, dmy.matrix);
        DECK_SMOKE.setColorAt(i, tmpC.setHex(0x3a3634).lerp(new THREE.Color(0x6a625c), ph));
      }
      DECK_SMOKE.instanceMatrix.needsUpdate = true; if (DECK_SMOKE.instanceColor) DECK_SMOKE.instanceColor.needsUpdate = true;
    }

    // ---------- explosion ----------
    const exOn = a > 0;
    updateWater(a);
    {
      FB.visible = exOn && a < 1.4;
      if (FB.visible) { const s = 3.6 * eout(a / 0.3) * (1 - smooth((a - 0.5) / 0.9)); FB.scale.set(s, s * 0.85, s); FB.position.set(E.x, 0.8 + s * 0.4 + a * 2, E.z); fireballM.emissiveIntensity = 1.0 * (1 - smooth(a / 1.4)); }
      blastL.intensity = exOn ? 900 * Math.exp(-a / 0.5) + 60 * Math.exp(-a / 3) : 0; blastL.position.set(E.x, 8, E.z);
      const life = exOn ? 1 - smooth((a - 11) / 2.5) : 0;
      SMOKE.visible = exOn && life > 0.01; SMOKE.material.opacity = life;
      if (SMOKE.visible) {
        const colH = 28 * eout(a / 2.6), spread = eout(a / 4);
        for (let i = 0; i < SN; i++) {
          let x, y, z, s, c;
          if (i < 70) { const f = i / 70; y = colH * f * 0.9 + 0.5; s = (1.2 + 2.0 * f) * (0.5 + 0.5 * eout(a / 1.2)) * (0.85 + 0.3 * hsh(i, 4)); const r = (hsh(i, 1) - 0.5) * 2.2 * (0.4 + f); x = E.x + r + Math.sin(a * 0.7 + i) * 0.3 + y * 0.05 * a / 6; z = E.z + (hsh(i, 2) - 0.5) * 2.2 * (0.4 + f); c = f < 0.18 ? 0 : f < 0.5 ? 1 : 2; }
          else if (i < 115) { const k = i - 70, ang = (k / 45) * Math.PI * 2 + hsh(k, 1) * 0.3, R = (3 + 6 * spread) * (0.65 + 0.35 * hsh(k, 2)); x = E.x + Math.cos(ang) * R + colH * 0.04 * a / 6; z = E.z + Math.sin(ang) * R; y = colH + 1.2 * Math.sin(ang * 3 + a) - 1.0 * hsh(k, 3) - R * 0.12; s = (2.2 + 2.2 * spread) * (0.8 + 0.4 * hsh(k, 4)); c = hsh(k, 5) < 0.4 ? 2 : 3; }
          else { const k = i - 115, ang = (k / 15) * Math.PI * 2, R = 2.5 * spread; x = E.x + Math.cos(ang) * R; z = E.z + Math.sin(ang) * R; y = colH + 2.6 * spread + 0.6 * hsh(k, 2); s = 2.6 + 2.6 * spread; c = 3; }
          s *= exOn ? Math.min(1, a / 0.35) : 0;
          dmy.position.set(x, y, z); dmy.scale.set(s, s * 0.85, s); dmy.rotation.set(i * 0.7, i * 1.3, 0); dmy.updateMatrix(); SMOKE.setMatrixAt(i, dmy.matrix);
          tmpC.copy(SC[c]); if (a < 2.5 && c < 2) tmpC.lerp(new THREE.Color(0xc0602a), 0.6 * (1 - a / 2.5));
          if (cold > 0) tmpC.lerp(new THREE.Color(0x5a5c60), cold * 0.4);
          SMOKE.setColorAt(i, tmpC);
        }
        SMOKE.instanceMatrix.needsUpdate = true; SMOKE.instanceColor.needsUpdate = true;
      }
      PR.forEach((m, i) => { const aa = a - i * 0.25; m.visible = exOn && aa > 0 && aa < 2.6; if (!m.visible) return; const R = 70 * eout(aa / 2.4); m.scale.set(R, R, 1); m.position.set(E.x, 1.2 + i * 0.6, E.z); m.material.opacity = 0.75 * (1 - aa / 2.6); });
      // debris
      for (let i = 0; i < 500; i++) {
        if (!exOn || a > 6) { DEBRIS.pos[i * 3 + 1] = -60; continue; }
        const ang = hsh(i, 1) * 6.283, v = 6 + hsh(i, 2) * 14, vy = 6 + hsh(i, 3) * 16, tt = Math.min(a, 4);
        const y = 1 + vy * tt - 4.9 * tt * tt; DEBRIS.pos[i * 3] = E.x + Math.cos(ang) * v * tt; DEBRIS.pos[i * 3 + 1] = y < 0 ? -60 : y; DEBRIS.pos[i * 3 + 2] = E.z + Math.sin(ang) * v * tt;
      }
      DEBRIS.commit();
      // shore spray where the harbour wave meets the shore
      for (let i = 0; i < 700; i++) {
        if (!exOn || a < 0.5 || a > 11) { SPRAY.pos[i * 3 + 1] = -60; continue; }
        const side = i % 2 ? 1 : -1, x = -30 + hsh(i, 1) * 60, z = zc(x) + side * (hw(x) + 2.6), d = Math.hypot(x - E.x, z - E.z), rw = 2 + 1.9 * a, k = Math.exp(-(((d - rw) / 2.5) ** 2)) * Math.exp(-a / 5);
        const ph = hsh(i, 2); SPRAY.pos[i * 3] = x; SPRAY.pos[i * 3 + 1] = k > 0.05 ? 0.3 + ph * 2.4 * k * 1.5 : -60; SPRAY.pos[i * 3 + 2] = z + side * ph * 1.2;
        SPRAY.col[i * 3] = SPRAY.col[i * 3 + 1] = SPRAY.col[i * 3 + 2] = 0.8 * Math.min(1, k * 2);
      }
      SPRAY.commit();
    }
    // 800 m ring
    const r8k = !hook && t > A("s6:radius") - 0.3 && t < K.s7 ? win(t, A("s6:radius") - 0.3, K.s7 - 0.4, 0.5, 0.5) : 0;
    R8.visible = r8k > 0.01; r8M.opacity = r8k;

    // ---------- houses: flatten as the shock passes, rebuild in s8 ----------
    const rebuild = t > K.s8 ? smooth((t - A("s8:Sejak") + 0.2) / 2.5) : 0;
    const snowK = t < K.s7 ? 0 : smooth((t - A("s7:badai") + 0.3) / 3);
    snowM.opacity = 0.78 * snowK;
    for (let i = 0; i < HN; i++) {
      const h = H[i];
      let f = 0;
      if (exOn) { const ta = h.dist / 22; const k = smooth((a - ta) / 0.35); f = h.dist < R800 ? k : h.dist < R800 + 9 ? k * 0.25 * (1 - (h.dist - R800) / 9) : 0; }
      f *= 1 - rebuild;
      const sy = h.h * (1 - 0.85 * f), tilt = f * (h.seed - 0.5) * 0.9;
      dmy.position.set(h.x, h.y, h.z); dmy.rotation.set(tilt * 0.6, h.ry + f * h.seed * 1.5, tilt); dmy.scale.set(h.w, sy, h.d); dmy.updateMatrix(); HB.setMatrixAt(i, dmy.matrix);
      dmy.position.set(h.x, h.y + sy, h.z); dmy.scale.set(h.w * 0.98, (0.45 + 0.1 * h.seed) * (1 - 0.9 * f), h.d * 0.98); dmy.position.x += Math.sin(tilt) * sy * -1; dmy.updateMatrix(); HR.setMatrixAt(i, dmy.matrix);
      tmpC.copy(BODYC[Math.floor(h.col * BODYC.length)]).lerp(charC, f * 0.65); HB.setColorAt(i, tmpC);
      tmpC.copy(ROOFC[Math.floor(h.seed * ROOFC.length)]).lerp(charC, f * 0.5).lerp(snowC, snowK * (1 - f * 0.5) * 0.9); HR.setColorAt(i, tmpC);
    }
    HB.instanceMatrix.needsUpdate = HR.instanceMatrix.needsUpdate = true; HB.instanceColor.needsUpdate = HR.instanceColor.needsUpdate = true;
    BIG.forEach((b) => { const f = exOn ? smooth((a - b.dist / 22) / 0.35) * (1 - rebuild) : 0; if (b.pier) { PIER.visible = f < 0.5; return; } b.g.scale.y = 1 - 0.8 * f; b.g.rotation.z = f * 0.2; });
    // post: roof gone after the blast (rebuilt in s8)
    { const f = exOn ? smooth((a - 0.4) / 0.3) * (1 - rebuild) : 0; POST.children[1].visible = f < 0.5; POST.children[1].position.y = 1.25; COL.G.visible = !hook && t > K.s4 && t < tE2; if (t > K.s5 && t < tE2) { const ph = t * 9; COL.pose("key", ph); } }

    // ---------- window glows / shards ----------
    {
      const wk = hook ? 0 : t > K.s8 ? smooth((t - A("s8:Halifax")) / 1.5) : win(t, A("s5:Ratusan") - 0.3, tE2, 0.6, 0.05);
      let n = 0;
      WSEL.forEach(([h, i]) => {
        for (let k = 0; k < 2; k++, n++) {
          const ok = wk > 0.02;
          dmy.position.set(h.x + (k ? 0.22 : -0.22), h.y + h.h * 0.55, h.z + h.d / 2 + 0.012); dmy.rotation.set(0, 0, 0); dmy.scale.setScalar(ok ? Math.min(1, wk) * (k ? 0.85 : 1) : 0.0001); dmy.updateMatrix(); WG.setMatrixAt(n, dmy.matrix);
        }
      });
      WG.instanceMatrix.needsUpdate = true;
      const sk = !hook && exOn && t < K.s7 ? 1 : 0, ka = t - A("s6:kaca") + 0.4;
      for (let i = 0; i < 500; i++) {
        const w = WSEL[i % WSEL.length][0];
        if (!sk || ka < 0 || ka > 2.4) { SHARD.pos[i * 3 + 1] = -60; continue; }
        const tt = ka * (0.8 + 0.4 * hsh(i, 1));
        SHARD.pos[i * 3] = w.x + (hsh(i, 2) - 0.5) * 0.8 + (hsh(i, 5) - 0.5) * tt * 0.8; SHARD.pos[i * 3 + 1] = w.y + w.h * 0.55 + tt * 1.2 - 2.4 * tt * tt; SHARD.pos[i * 3 + 2] = w.z + w.d / 2 + tt * (1.5 + hsh(i, 3) * 2);
        if (SHARD.pos[i * 3 + 1] < w.y) SHARD.pos[i * 3 + 1] = -60;
      }
      SHARD.commit();
    }

    // ---------- lifeboat, watchers, trains, telegraph ----------
    {
      const bk = !hook && t > A("s5:Awak") - 0.3 && t < tE2 + 0.1;
      BOAT.visible = bk;
      if (bk) { const u = smooth((t - A("s5:Awak") + 0.3) / 6), mpp = mbPose(A("s5:Awak")); BOAT.position.set(lerp(mpp[0] + 0.5, mpp[0] - 1.5, u), 0.02 * Math.sin(t * 2), lerp(mpp[1] + 1.3, 6.4, u)); BOAT.rotation.y = -0.9; CREW.forEach((c, i) => c.pose("sit", t * 4 + i * 0.2)); }
      WATCH.forEach((w) => (w.G.visible = !hook && t > K.s4 && (!exOn || t > K.s8)));
      // passenger train: rolls in from the basin side and halts at the red signal
      const tk = !hook && t > A("s5:Petugas") - 0.5 && t < K.s7;
      TRAIN.G.visible = tk;
      if (tk) { const u = smooth((t - A("s5:Petugas") + 0.5) / (A("s5:datang") - A("s5:Petugas") + 0.8)); TRAIN.place(lerp(31, 22, u)); }
      const red = !hook && t > A("s5:menghentikan") - 0.2 && t < K.s8;
      sigLamp.material.emissive.setHex(red ? 0xff3a2a : 0x3aff6a); sigLamp.material.color.setHex(red ? 0x441410 : 0x143a1a); sigLamp.material.emissiveIntensity = red ? 0.9 : 0.5;
      const rk = !hook && t > A("s7:bantuan") - 1.2 && t < K.s8 + 0.5;
      RELIEF.G.visible = rk;
      if (rk) { const u = smooth((t - A("s7:bantuan") + 1.2) / (A("s7:Boston") - A("s7:bantuan") + 2.4)); RELIEF.place(lerp(31, 14, u)); }
      const twk = !hook && t > A("s5:mengirim") - 0.2 && t < tE2;
      TW.forEach((w, i) => {
        w.visible = twk; if (!twk) return;
        const ph = ((t - A("s5:mengirim")) * 0.9 + i / 5) % 1;
        w.position.set(POST.position.x + 0.9 + ph * 12, POST.position.y + 2.6, POST.position.z + 0.2 - ph * 1.2); w.rotation.set(0, Math.PI / 2, 0); w.rotation.z = -0.7; w.scale.setScalar(0.4 + ph * 1.6); w.material.opacity = 0.9 * (1 - ph);
      });
    }

    // ---------- snow ----------
    {
      const sf = t < K.s7 ? 0 : snowK * (t < K.s8 ? 1 : 0.5);
      const cx = cam.position.x, cz = cam.position.z;
      for (let i = 0; i < 2200; i++) {
        if (sf < 0.01 || i > 2200 * sf) { SNOW.pos[i * 3 + 1] = -60; continue; }
        const ph = (t * (0.12 + 0.05 * hsh(i, 1)) + hsh(i, 2)) % 1;
        SNOW.pos[i * 3] = cx - 40 + hsh(i, 3) * 80 + Math.sin(t * 0.6 + i) * 0.6 - ph * 6; SNOW.pos[i * 3 + 1] = 32 - ph * 34; SNOW.pos[i * 3 + 2] = cz - 70 + hsh(i, 4) * 80;
      }
      SNOW.commit();
      treeSnow.forEach((s) => (s.visible = true));
    }
    // ---------- tree ship ----------
    {
      const on = t > K.s8 - 0.3;
      TSHIP.G.visible = on;
      if (on) { const x = tsX(t)[0]; TSHIP.G.position.set(x, 0.04 * Math.sin(t * 1.2), 1.0); TSHIP.G.rotation.set(0, Math.PI, 0.01 * Math.sin(t)); }
    }

    // ---------- camera ----------
    if (hook) {
      setCam(S.hook(t));
      const d = t - tE1; if (d > 0 && d < 1.3) { const s = 0.35 * (1 - d / 1.3); cam.position.x += Math.sin(d * 41) * s; cam.position.y += Math.sin(d * 57) * s; }
    } else if (t < K.s3 - 0.12) setCam(S.s2(t));
    else if (t < A("s3:Dari")) { const m = mbX(t)[0], r0 = s3rel(t); setCam([m + r0[0], r0[1], C_MB[1] + r0[2], m + r0[3], r0[4], C_MB[1] + r0[5]]); }
    else if (t < K.s4 - 0.12) setCam(s3abs(t));
    else if (t < K.s5 - 0.12) { setCam(S.s4(t)); const d = t - tHit; if (d > 0 && d < 0.8) cam.position.y += Math.sin(d * 40) * 0.05 * (1 - d / 0.8); }
    else if (t < K.s6 - 0.12) setCam(S.s5(t));
    else if (t < K.s7 - 0.12) { setCam(S.s6(t)); const d = t - tE2; if (d > 0 && d < 1.3) { const s = 0.35 * (1 - d / 1.3); cam.position.x += Math.sin(d * 41) * s; cam.position.y += Math.sin(d * 57) * s; } }
    else if (t < K.s8 - 0.12) setCam(S.s7(t));
    else setCam(s8(t));

    // ---------- 3D labels ----------
    if (!hook) {
      const w2 = t < K.s3 ? win(t, A("s2:Halifax") - 0.2, A("s2:Perang") - 0.2, 0.4, 0.3) : 0;
      showLab(L.hal, w2, new V3(-12, 6, -20), 1.1); showLab(L.dart, w2, new V3(-6, 4.5, 17), 1.1);
      showLab(L.nar, w2, new V3(8, 2.5, 0.5), 0.9); showLab(L.bed, w2, new V3(31, 2.5, 4), 0.9);
      showLab(L.pier, t < K.s3 ? win(t, A("s2:Desember") - 0.2, A("s2:Perang") - 0.2, 0.4, 0.3) : t > K.s6 - 0.2 && t < tE2 ? win(t, K.s6 - 0.2, tE2 - 0.1, 0.3, 0.1) : 0, new V3(2, 3.2, -8), 0.9);
      showLab(L.rich, w2, new V3(12, 6.5, -18), 0.9);
      showLab(L.eur, t < K.s3 + 0.5 ? win(t, A("s2:kapal") - 0.3, K.s3 + 0.3, 0.4, 0.3) : 0, new V3(-31, 2.6, 2.2), 1.0);
      if (MB.G.visible && t < K.s4) {
        const mx = MB.G.position.x, mz = MB.G.position.z;
        showLab(L.mb, win(t, A("s3:Mont-Blanc") - 0.2, A("s3:Muatannya") - 0.2, 0.3, 0.3), new V3(mx, 4.6, mz), 0.9);
        showLab(L.tnt, win(t, A("s3:TNT") - 0.1, A("s3:Dari") - 0.2, 0.25, 0.3), new V3(mx + 1.1, 1.9, mz + 1.4), 0.6);
        showLab(L.pik, win(t, A("s3:pikrat") - 0.1, A("s3:Dari") - 0.2, 0.25, 0.3), new V3(mx + 3.0, 1.9, mz + 1.4), 0.6);
        showLab(L.ben, win(t, A("s3:bensol") - 0.1, A("s3:Dari") - 0.2, 0.25, 0.3), new V3(mx + 1.8, 2.6, mz - 0.4), 0.6);
        showLab(L.mb, t > A("s3:Dari") ? win(t, A("s3:Dari"), K.s4 - 0.2, 0.3, 0.3) : 0, new V3(mx, 4.0, mz), 0.9);
      }
      if (t > A("s3:Imo") - 0.3 && t < K.s4) showLab(L.imo, win(t, A("s3:Imo") - 0.2, K.s4 - 0.2, 0.3, 0.3), new V3(IMO.G.position.x, 4.0, IMO.G.position.z), 0.9);
      if (t > A("s3:salah") - 0.4 && t < K.s4) showLab(L.wrong, win(t, A("s3:salah") - 0.3, K.s4 - 0.2, 0.3, 0.3), new V3(10, 1.6, 4.5), 0.8);
      if (t > A("s4:lambat") - 0.3 && t < A("s4:Tapi")) showLab(L.slow, win(t, A("s4:lambat") - 0.2, A("s4:Tapi") - 0.2, 0.3, 0.3), new V3(-2.8, 2.0, 5.4), 0.55);
      if (t > A("s5:Petugas") - 0.3 && t < A("s5:penumpang")) showLab(L.post, win(t, A("s5:Petugas") - 0.2, A("s5:penumpang") - 0.3, 0.3, 0.3), new V3(POST.position.x, POST.position.y + 3.0, POST.position.z), 0.7);
      if (t > A("s5:penumpang") - 0.3 && t < K.s6) showLab(L.trn, win(t, A("s5:penumpang") - 0.2, K.s6 - 0.3, 0.3, 0.3), new V3(TRAIN.parts[1].position.x + TRAIN.G.position.x, 3.2, TRAIN.parts[1].position.z + TRAIN.G.position.z), 0.7);
      if (r8k > 0.01) showLab(L.r8, r8k, new V3(E.x + R800 * 0.7, 3, E.z + R800 * 0.72), 0.8);
      if (t > A("s7:bantuan") - 0.5 && t < K.s8) showLab(L.rel, win(t, A("s7:bantuan") - 0.3, K.s8 - 0.3, 0.3, 0.3), new V3(RELIEF.parts[1].position.x + RELIEF.G.position.x, 3.0, RELIEF.parts[1].position.z + RELIEF.G.position.z), 0.7);
    }
    comp.render();
  };
}
