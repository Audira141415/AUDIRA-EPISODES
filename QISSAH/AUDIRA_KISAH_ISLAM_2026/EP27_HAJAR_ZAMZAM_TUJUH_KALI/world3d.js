// EP27 HAJAR, ZAMZAM, TUJUH KALI. SULAMFORGE: the whole valley is an embroidery on linen stretched in a wooden hoop.
// Sand satin-stitch mounds ring the barren valley; Shafa (near, left in the side view) and Marwah (far, right) are raised
// embroidered mounds joined by seven running-stitch lanes that a needle sews (hook preview, unpicked, then sewn for real
// in s5). No person is ever shown: Hajar = a moving indigo hem/shawl ribbon + madder stitched footprints; Ibrahim =
// umber stitched footprints only; baby Ismail = a small quilted cradle cloth. Zamzam = blue silk beads bursting from the
// ground into a satin pool, closed in by two abstract cupping arcs. Pilgrims = tiny cream french knots on the lanes.
// Ka'bah: a small black cube with a gold band far off, never touched. AUDIRA: a stitched monogram near the hoop rim.
// Every value is a pure function of t. World: x east, z south, y up; linen at y = 0, hoop radius 40.7.
import * as THREE from "./three.module.js";
import { mulberry, ramp, clamp01, eout, back, canvasTex, track, stage } from "./lib3d.js";

const lin = (t, a, b) => clamp01((t - a) / (b - a));
const deg = Math.PI / 180;

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp } = stage(canvas, { bg: "#2a1c13", fog: 0.0016, exp: 1.02, bloom: [0.3, 0.45, 0.9], fov: 38 });
  const OY = 130;
  cam.setViewOffset(1080, 1920, 0, -OY, 1080, 1920);

  // ---------- anchors
  const A = (k) => AT[k];
  const tJut = A("s1:Jutaan"), tMem = A("s2:membawa"), tIsm = A("s2:Ismail");
  const tSek = A("s3:sekantong"), tSed = A("s3:sedikit"), tBer = A("s3:berjalan"), tH3 = A("s3:Hajar"), tKata = A("s3:berkata");
  const tAir = A("s5:Air"), tBayi = A("s5:Bayinya"), tNaik = A("s5:naik"), tLari = A("s5:berlari");
  const tSua = A("s6:suara"), tPan = A("s6:memancar"), tBen = A("s6:membendungnya"), tIsi = A("s6:mengisi"), tZam = A("s6:Zamzam");
  const tAsal = A("s7:asal"), tShafa7 = A("s7:Shafa"), tAud = A("s8:AUDIRA");
  const lap = (arr, t) => { if (t <= arr[0][0]) return arr[0][1]; for (let i = 1; i < arr.length; i++) if (t <= arr[i][0]) { const p = arr[i - 1], n = arr[i]; return p[1] + (n[1] - p[1]) * (t - p[0]) / (n[0] - p[0]); } return arr[arr.length - 1][1]; };
  const lapEnd = K.lapB[K.lapB.length - 1][0];
  const Dt = (t) => (t < K.s2 - 0.12 ? lap(K.lapA, t) : t < tLari - 0.5 ? 7 * (1 - ramp(t, K.s2 - 0.12, K.s2 + 0.9)) : lap(K.lapB, t));

  // ---------- lights
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x5a4634, 0.95));
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.3);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const SC = sun.shadow.camera; SC.near = 1; SC.far = 500;
  const SUN = new THREE.Vector3(-0.5, 0.74, 0.45).normalize();
  const fill = new THREE.DirectionalLight(0xcdd9ff, 0.35); fill.position.set(30, 25, -40); scene.add(fill);

  // ---------- textures
  const linenTex = canvasTex(256, 256, (x, w, h) => {
    const rr = mulberry(5);
    x.fillStyle = "#e6d9bf"; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h; j += 4) for (let i = 0; i < w; i += 4) {
      if ((i / 4 + j / 4) % 2 === 0) { x.fillStyle = `rgba(255,250,238,${0.3 + rr() * 0.25})`; x.fillRect(i, j + 1, 4, 2); }
      else { x.fillStyle = `rgba(118,96,66,${0.16 + rr() * 0.12})`; x.fillRect(i + 1, j, 2, 4); }
    }
    for (let k = 0; k < 36; k++) { x.fillStyle = "rgba(150,122,86,.2)"; x.fillRect((rr() * (w - 30)) | 0, ((rr() * h) | 0) & ~3, 6 + rr() * 24, 2); }
  }, [64, 64]);
  const satin = (cols, n = 72, rep = [1, 1], seed = 1) => canvasTex(512, 256, (x, w, h) => {
    const rr = mulberry(seed), sw = w / n;
    for (let i = 0; i < n; i++) {
      x.fillStyle = cols[(rr() * cols.length) | 0]; x.fillRect(i * sw, 0, sw + 1, h);
      const g = x.createLinearGradient(i * sw, 0, (i + 1) * sw, 0);
      g.addColorStop(0, "rgba(40,22,8,.32)"); g.addColorStop(0.5, "rgba(255,248,230,.26)"); g.addColorStop(1, "rgba(40,22,8,.32)");
      x.fillStyle = g; x.fillRect(i * sw, 0, sw + 1, h);
      for (let k = 0; k < 3; k++) { x.fillStyle = "rgba(40,22,8,.25)"; x.fillRect(i * sw, (rr() * h) | 0, sw, 1.5); }
    }
  }, rep);
  const sandTex = satin(["#d9bd8c", "#cfae78", "#e2c99c", "#c8a26c"], 90, [5, 1], 11);
  const sandTex2 = satin(["#c9a06a", "#bf935c", "#d4b07c", "#b88855"], 90, [5, 1], 12);
  const shafaTex = satin(["#d79a5a", "#cc8a4c", "#e0a96b"], 96, [6, 1], 13);
  const marwaTex = satin(["#c98a63", "#bd7b55", "#d39a72"], 96, [6, 1], 14);
  const blueTex = satin(["#2f6fd6", "#3b82e8", "#2a5fbf", "#5aa0f2"], 80, [4, 1], 15);
  const ochreTex = satin(["#c99a5b", "#bf8d4d", "#d6aa6c"], 60, [2, 1], 16);
  const woodTex = canvasTex(512, 64, (x, w, h) => { const rr = mulberry(7); x.fillStyle = "#a8743f"; x.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { x.strokeStyle = `rgba(${rr() < 0.5 ? "90,52,22" : "200,150,95"},${0.2 + rr() * 0.3})`; x.lineWidth = 1 + rr() * 2; x.beginPath(); const y = rr() * h; x.moveTo(0, y); for (let k = 0; k <= 8; k++) x.lineTo((k / 8) * w, y + Math.sin(k + i) * 2); x.stroke(); } }, [8, 1]);
  const tableTex = canvasTex(256, 256, (x, w, h) => { const rr = mulberry(8); x.fillStyle = "#3a2618"; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${rr() < 0.5 ? "20,12,6" : "90,60,36"},${0.25 + rr() * 0.3})`; x.lineWidth = 1 + rr() * 2.5; const y = rr() * h; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + rr() * 8 - 4, w * 0.7, y + rr() * 8 - 4, w, y); x.stroke(); } }, [10, 10]);
  const footTex = canvasTex(128, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = "rgba(255,255,255,.32)";
    x.beginPath(); x.ellipse(64, 160, 30, 74, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#fff"; x.lineWidth = 9; x.lineCap = "round"; x.setLineDash([15, 11]);
    x.beginPath(); x.ellipse(64, 160, 30, 74, 0, 0, Math.PI * 2); x.stroke();
    x.setLineDash([]); x.fillStyle = "#fff";
    [[38, 66, 9], [52, 54, 9], [66, 50, 10], [80, 54, 9], [92, 66, 8]].forEach(([cx, cy, r]) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); });
  });
  const shawlTex = canvasTex(512, 64, (x, w, h) => {
    x.fillStyle = "#2b3a7a"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 3) { x.fillStyle = i % 6 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; x.fillRect(i, 0, 1.5, h); }
    x.fillStyle = "#c4472f"; x.fillRect(0, 4, w, 7); x.fillRect(0, h - 11, w, 7);
    x.strokeStyle = "#e2b65c"; x.lineWidth = 2.5; x.beginPath();
    for (let i = 0; i <= w; i += 12) { x.lineTo(i, i % 24 ? 16 : 26); } x.stroke();
    x.beginPath(); for (let i = 0; i <= w; i += 12) { x.lineTo(i, i % 24 ? h - 16 : h - 26); } x.stroke();
    x.fillStyle = "#e2b65c"; for (let i = 24; i < w; i += 48) { x.save(); x.translate(i, h / 2); x.rotate(Math.PI / 4); x.fillRect(-5, -5, 10, 10); x.restore(); }
  });
  const quiltTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = "#dfe8f0"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "#7fa7cf"; x.lineWidth = 3;
    for (let i = 16; i < w; i += 24) for (let j = 16; j < h; j += 24) { x.beginPath(); x.moveTo(i - 5, j - 5); x.lineTo(i + 5, j + 5); x.moveTo(i + 5, j - 5); x.lineTo(i - 5, j + 5); x.stroke(); }
    x.strokeStyle = "#c4472f"; x.lineWidth = 6; x.setLineDash([12, 8]); x.strokeRect(10, 10, w - 20, h - 20);
  });
  const burlapTex = canvasTex(128, 128, (x, w, h) => { x.fillStyle = "#9a7448"; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { x.fillStyle = "rgba(60,38,18,.35)"; x.fillRect(i, 0, 1.5, h); x.fillRect(0, i, w, 1.5); } }, [3, 3]);
  const leatherTex = canvasTex(128, 128, (x, w, h) => { const rr = mulberry(9); x.fillStyle = "#b07a46"; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${rr() < 0.5 ? "70,40,15" : "220,170,120"},.18)`; x.fillRect(rr() * w, rr() * h, 2 + rr() * 4, 2 + rr() * 3); } x.strokeStyle = "#f0dcb4"; x.lineWidth = 3; x.setLineDash([7, 5]); x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke(); });
  const kabahTex = canvasTex(128, 128, (x, w, h) => { x.fillStyle = "#121212"; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 3) { x.fillStyle = i % 6 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.25)"; x.fillRect(i, 0, 1.5, h); } });
  const bandTex = canvasTex(256, 32, (x, w, h) => { x.fillStyle = "#c99a3c"; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { x.fillStyle = i % 8 ? "rgba(255,240,190,.35)" : "rgba(90,60,10,.3)"; x.fillRect(i, 0, 2, h); } x.fillStyle = "#7a5414"; x.fillRect(0, 3, w, 2); x.fillRect(0, h - 5, w, 2); });
  function stitchText(txt, col, dark, font) {
    return canvasTex(1024, 256, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.font = font; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = col; x.fillText(txt, w / 2, h / 2 + 8);
      x.globalCompositeOperation = "source-atop";
      let c = 0;
      for (let i = -h; i < w + h; i += 6) { x.strokeStyle = c++ % 2 ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.22)"; x.lineWidth = 3; x.beginPath(); x.moveTo(i, h); x.lineTo(i + h * 0.45, 0); x.stroke(); }
      x.globalCompositeOperation = "source-over";
      x.setLineDash([12, 8]); x.lineWidth = 4; x.strokeStyle = dark; x.strokeText(txt, w / 2, h / 2 + 8);
    });
  }

  // ---------- ground: mounds
  const MOUNDS = [];
  const e0 = Math.exp(-4.84);
  const mh = (d, H, s) => (d >= 2.2 * s ? 0 : (H * (Math.exp(-((d / s) ** 2)) - e0)) / (1 - e0));
  const groundY = (x, z) => { let y = 0; for (const m of MOUNDS) y += mh(Math.hypot(x - m.x, z - m.z), m.H, m.s); return y; };
  function mound(x, z, H, s, tex, wob, seed) {
    const pts = [], Rm = 2.2 * s;
    for (let i = 28; i >= 0; i--) { const r = (Rm * i) / 28; pts.push(new THREE.Vector2(r, mh(r, H, s) + 0.005)); }
    const g = new THREE.LatheGeometry(pts, 72);
    if (wob) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const px = p.getX(i), pz = p.getZ(i), th = Math.atan2(pz, px); const k = 1 + wob * (0.6 * Math.sin(3 * th + seed) + 0.4 * Math.sin(5 * th + 2 * seed)); p.setX(i, px * k); p.setZ(i, pz * k); } g.computeVertexNormals(); }
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 1.2, roughness: 0.55, metalness: 0.02 }));
    m.position.set(x, 0, z); m.receiveShadow = m.castShadow = true; scene.add(m);
    if (!wob) MOUNDS.push({ x, z, H, s });
    return m;
  }
  const S = { x: 0, z: 7 }, M = { x: 0, z: -9 };
  mound(S.x, S.z, 2.4, 2.0, shafaTex, 0, 0);
  mound(M.x, M.z, 2.2, 1.9, marwaTex, 0, 0);
  const HILLS = [[72, 27, 4, 4.2], [98, 24, 3, 3.4], [148, 28, 5.5, 4.9], [176, 25, 4.5, 4.4], [202, 30, 6, 4.4], [222, 22, 3.2, 3.4], [268, 26, 5, 4.6], [292, 30, 6, 4.3], [318, 24, 3.6, 3.8], [40, 21, 2.4, 2.6]];
  HILLS.forEach(([a, r, H, s], i) => mound(Math.cos(a * deg) * r, Math.sin(a * deg) * r, H, s, i % 2 ? sandTex : sandTex2, 0.13, i * 1.7));

  // linen in the hoop, the drape outside it, the table
  const linenM = new THREE.MeshStandardMaterial({ map: linenTex, bumpMap: linenTex, bumpScale: 1.4, roughness: 0.93 });
  const linen = new THREE.Mesh(new THREE.CircleGeometry(41.3, 180).rotateX(-Math.PI / 2), linenM);
  linen.receiveShadow = true; scene.add(linen);
  const dg = new THREE.RingGeometry(41.2, 80, 180, 10).rotateX(-Math.PI / 2);
  { const p = dg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), th = Math.atan2(z, x), k = (r - 41.2) / 38.8; p.setY(i, 0.55 - 1.4 * Math.min(1, k * 8) - k * 13 - 1.3 * Math.sin(th * 17 + r * 0.2) * k); } dg.computeVertexNormals(); }
  const drape = new THREE.Mesh(dg, new THREE.MeshStandardMaterial({ map: linenTex, color: 0xd9ccb2, roughness: 0.95, side: THREE.DoubleSide }));
  drape.receiveShadow = true; scene.add(drape);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(700, 700).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tableTex, roughness: 0.7 }));
  table.position.y = -15.5; table.receiveShadow = true; scene.add(table);
  const woodM = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.5 });
  for (const [R, y] of [[40.75, 0.5], [41.95, 0.55]]) { const h = new THREE.Mesh(new THREE.TorusGeometry(R, 0.78, 16, 240).rotateX(-Math.PI / 2), woodM); h.position.y = y; h.castShadow = h.receiveShadow = true; scene.add(h); }
  const clamp = new THREE.Group(); clamp.position.set(0, 0.6, -43.4); scene.add(clamp);
  { const b1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.7, 2.2), woodM); clamp.add(b1); const brass = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.85, roughness: 0.3 }); const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 4.4, 20).rotateZ(Math.PI / 2), brass); sc.position.y = 0.2; clamp.add(sc); const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 24).rotateZ(Math.PI / 2), brass); kn.position.set(2.4, 0.2, 0); clamp.add(kn); }

  // ---------- instanced helpers
  const tv = new THREE.Vector3(), tq = new THREE.Quaternion(), ts = new THREE.Vector3(), tm = new THREE.Matrix4(), UP = new THREE.Vector3(0, 1, 0), te = new THREE.Euler();
  const inst = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m; };
  const dashGeo = new THREE.CapsuleGeometry(0.075, 0.2, 3, 8);
  const ringStitch = (cx, cz, R, col, n, y0 = 0.05) => {
    const m = inst(dashGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.45 }), n, false);
    const L = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R; L.push({ p: new THREE.Vector3(x, groundY(x, z) + y0, z), q: new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(-Math.sin(a), 0, Math.cos(a))) }); }
    const set = (k) => { for (let i = 0; i < n; i++) { const s = clamp01((k * n - i) / 1.5); tm.compose(L[i].p, L[i].q, ts.set(s * 0.6, s * 0.75, s * 0.6)); m.setMatrixAt(i, tm); } m.instanceMatrix.needsUpdate = true; };
    set(1); return set;
  };
  ringStitch(S.x, S.z, 4.5, 0x8a5a2b, 40);
  ringStitch(M.x, M.z, 4.3, 0x8a5a2b, 38);

  // ---------- the seven lanes (running stitch)
  const lanePt = (k, u, o) => {
    const v = k % 2 === 0 ? u : 1 - u, vv = 0.07 + 0.86 * v, sn = Math.sin(Math.PI * vv);
    const z = S.z + (M.z - S.z) * vv, x = (k - 3) * 0.34 * Math.pow(sn, 0.7) + 0.25 * Math.sin(vv * Math.PI * 2 + k * 0.7) * sn;
    return o.set(x, groundY(x, z) + 0.06, z);
  };
  const ND = 34, NL = 7;
  const MADDER = new THREE.Color(0xc0402c), GOLD = new THREE.Color(0xe0ac45);
  const laneM = new THREE.MeshStandardMaterial({ color: MADDER, roughness: 0.4, metalness: 0.05, emissive: 0x000000 });
  const lanes = inst(dashGeo, laneM, ND * NL);
  const DASH = [];
  { const a = new THREE.Vector3(), b = new THREE.Vector3(); for (let k = 0; k < NL; k++) for (let j = 0; j < ND; j++) { const u = (j + 0.5) / ND; const p = lanePt(k, u, new THREE.Vector3()); lanePt(k, Math.min(1, u + 0.01), a); lanePt(k, Math.max(0, u - 0.01), b); DASH.push({ k, u, p, q: new THREE.Quaternion().setFromUnitVectors(UP, a.sub(b).normalize()) }); } }

  // ---------- places
  const C = new THREE.Vector3(-5.2, 0, 1.4), Z = new THREE.Vector3(-6.6, 0, -1.6), KB = new THREE.Vector3(-14, 0, -11);
  const HC = new THREE.Vector3(-6.7, 0, 1.0), HZ = new THREE.Vector3(-5.6, 0, -0.4);
  const E = new THREE.Vector3(-15, 0, 24), F = new THREE.Vector3(-12, 0, -22);
  const bez = (p0, p1, p2, u, o) => { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; o.set(a * p0.x + b * p1.x + c * p2.x, 0, a * p0.z + b * p1.z + c * p2.z); o.y = groundY(o.x, o.z); return o; };
  const ARR_C = new THREE.Vector3(-13, 0, 10), DEP0 = new THREE.Vector3(-5.6, 0, 0.2), DEP_C = new THREE.Vector3(-2.5, 0, -10), APP_C = new THREE.Vector3(-4.5, 0, 5.2);
  const SA = lanePt(0, 0, new THREE.Vector3()), MB = lanePt(6, 1, new THREE.Vector3());
  const fArr = (u, o) => bez(E, ARR_C, HC, u, o), fDep = (u, o) => bez(DEP0, DEP_C, F, u, o), fApp = (u, o) => bez(HC, APP_C, SA, u, o);
  const fMZ = (u, o) => { o.lerpVectors(MB, HZ, u); o.y = groundY(o.x, o.z); return o; };

  // ---------- Ka'bah (far, small, dignified)
  const kab = new THREE.Group(); kab.position.copy(KB); scene.add(kab);
  { const cube = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.9), new THREE.MeshStandardMaterial({ map: kabahTex, roughness: 0.75 })); cube.position.y = 0.5; cube.castShadow = cube.receiveShadow = true; kab.add(cube); const band = new THREE.Mesh(new THREE.BoxGeometry(0.93, 0.11, 0.93), new THREE.MeshStandardMaterial({ map: bandTex, color: 0xffffff, metalness: 0.55, roughness: 0.35 })); band.position.y = 0.74; kab.add(band); }
  { const n = 36, m = inst(dashGeo, new THREE.MeshStandardMaterial({ color: 0xd9a443, roughness: 0.4, metalness: 0.3 }), n, false); for (let i = 0; i < n; i++) { const side = Math.floor(i / 9), f = ((i % 9) + 0.5) / 9 * 1.8 - 0.9, H = 0.95; const [x, z, dx] = side === 0 ? [f, -H, 1] : side === 1 ? [H, f, 0] : side === 2 ? [-f, H, 1] : [-H, -f, 0]; tm.compose(tv.set(KB.x + x, 0.05, KB.z + z), tq.setFromUnitVectors(UP, dx ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1)), ts.set(1, 1, 1)); m.setMatrixAt(i, tm); } }

  // ---------- footprints (stitched outlines)
  const footGeo = new THREE.PlaneGeometry(0.34, 0.68).rotateX(-Math.PI / 2);
  const footMat = (c) => new THREE.MeshStandardMaterial({ map: footTex, color: c, transparent: true, alphaTest: 0.25, roughness: 0.6, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  function trail(fn, sp, off, id, out) {
    const N = 240, P = []; let L = 0; const a = new THREE.Vector3(), b = new THREE.Vector3();
    for (let i = 0; i <= N; i++) { fn(i / N, a); if (i) L += a.distanceTo(b); P.push({ u: i / N, L, x: a.x, z: a.z }); b.copy(a); }
    let side = 1, j = 0;
    for (let s = sp * 0.5; s < L; s += sp) {
      while (P[j + 1] && P[j + 1].L < s) j++;
      const p = P[j], q = P[Math.min(N, j + 2)], dx = q.x - p.x, dz = q.z - p.z, dl = Math.hypot(dx, dz) || 1, nx = -dz / dl, nz = dx / dl;
      const x = p.x + nx * (off + side * 0.13), z = p.z + nz * (off + side * 0.13);
      out.push({ id, f: s / L, x, y: groundY(x, z) + 0.035, z, psi: Math.atan2(-dx, -dz), mir: side }); side = -side;
    }
    return L;
  }
  const HAJ = [], IBR = [];
  trail(fArr, 0.62, -0.42, "arr", HAJ); trail(fArr, 0.7, 0.42, "arr", IBR);
  trail(fDep, 0.72, 0, "dep", IBR);
  trail((u, o) => fDep(u * 0.26, o), 0.6, -0.6, "fol", HAJ);
  trail(fApp, 0.6, 0, "app", HAJ);
  { const d = new THREE.Vector3(); fDep(0.97, d); const psi = Math.atan2(-(DEP_C.x - F.x), -(DEP_C.z - F.z)); for (const sd of [-1, 1]) IBR.push({ id: "turn", f: 0, x: F.x + Math.cos(psi) * 0.16 * sd, y: 0.035, z: F.z - Math.sin(psi) * 0.16 * sd, psi, mir: sd }); }
  const fpH = inst(footGeo, footMat(0xc0402c), HAJ.length, false), fpI = inst(footGeo, footMat(0x5b3a22), IBR.length, false);

  // ---------- Hajar's head position (drives hem + needle)
  const t1 = new THREE.Vector3(), t2 = new THREE.Vector3();
  const lanePos = (D, o) => { const Dc = Math.min(7, Math.max(0, D)); const k = Math.min(6, Math.floor(Dc)); return lanePt(k, Dc - k, o); };
  function H(t, o) {
    if (t < 6) return lanePos(Dt(Math.min(t, 3.6)), o);
    if (t < tMem + 2.3) return fArr(lin(t, tMem, tMem + 2.3), o);
    if (t < tH3) return o.copy(HC);
    if (t < tKata) return fDep(0.26 * eout(lin(t, tH3, tH3 + 2.6)), o);
    if (t < tKata + 2.4) return fDep(0.26 * (1 - ramp(t, tKata, tKata + 2.0)), o).lerp(HC, ramp(t, tKata + 1.6, tKata + 2.4));
    if (t < tNaik) return o.copy(HC);
    if (t < tNaik + 1.1) return fApp(ramp(t, tNaik, tNaik + 1.1), o);
    if (t < tLari) { const a = (t - tNaik - 1.1) * 2.2; o.set(SA.x + 0.4 * Math.sin(a), 0, SA.z + 0.3 * (Math.cos(a) - 1)); o.y = groundY(o.x, o.z) + 0.06; return o; }
    if (t < lapEnd + 0.05) return lanePos(Dt(t), o);
    if (t < tSua + 0.1) return o.copy(MB);
    if (t < tPan) return fMZ(ramp(t, tSua + 0.1, tPan - 0.05), o);
    return o.copy(HZ);
  }
  const hemA = (t) => Math.max(1 - ramp(t, 3.7, 4.3), ramp(t, tMem - 0.2, tMem + 0.3) * (1 - ramp(t, K.s7 + 0.4, K.s7 + 1.4)));

  // hem / shawl ribbon
  const NR = 48;
  const ribG = new THREE.PlaneGeometry(1, 1, NR, 1);
  const rib = new THREE.Mesh(ribG, new THREE.MeshStandardMaterial({ map: shawlTex, roughness: 0.62, side: THREE.DoubleSide }));
  rib.frustumCulled = false; rib.castShadow = true; scene.add(rib);
  // needle + its thread
  const needle = new THREE.Group(); scene.add(needle);
  { const steel = new THREE.MeshStandardMaterial({ color: 0xdfe3ea, metalness: 0.95, roughness: 0.18 }); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.5, 12), steel); sh.position.y = 1.35; needle.add(sh); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.3, 12).rotateX(Math.PI), steel); tip.position.y = 0.0; needle.add(tip); const eye = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 16), steel); eye.position.y = 2.65; needle.add(eye); needle.traverse((m) => { if (m.isMesh) m.castShadow = true; }); }
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), laneM); thread.frustumCulled = false; scene.add(thread);
  const eyeP = new THREE.Vector3(), hp = new THREE.Vector3(), hq = new THREE.Vector3(), dirv = new THREE.Vector3(), perp = new THREE.Vector3();

  // ---------- cradle cloth, date sack, water skin
  const cradle = new THREE.Group(); cradle.position.set(C.x, 0, C.z); cradle.rotation.y = 0.5; scene.add(cradle);
  { const q = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshStandardMaterial({ map: quiltTex, roughness: 0.85 })); q.scale.set(0.95, 0.17, 0.62); q.position.y = 0.1; cradle.add(q); const pil = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 6, 14).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.8 })); pil.position.set(-0.62, 0.2, 0); cradle.add(pil); const fold = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshStandardMaterial({ color: 0x9fbedf, roughness: 0.8 })); fold.scale.set(0.5, 0.13, 0.56); fold.position.set(0.2, 0.22, 0); cradle.add(fold); cradle.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); }
  const sack = new THREE.Group(); sack.position.set(-3.8, 0, 0.9); scene.add(sack);
  { const g = new THREE.SphereGeometry(0.55, 28, 18); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = 1 + 0.08 * Math.sin(p.getX(i) * 9) * Math.cos(p.getZ(i) * 7) - (y > 0.25 ? (y - 0.25) * 1.2 : 0); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } g.computeVertexNormals(); const b = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: burlapTex, roughness: 0.95 })); b.position.y = 0.5; b.scale.y = 1.15; sack.add(b); const tie = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 18).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc0402c, roughness: 0.5 })); tie.position.y = 1.02; sack.add(tie); const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 10), b.material); tuft.position.y = 1.2; sack.add(tuft); const dateM = new THREE.MeshStandardMaterial({ color: 0x5a2a12, roughness: 0.3, metalness: 0.05 }); [[0.7, 0.2], [0.85, -0.15], [0.55, -0.4], [0.95, 0.15], [0.7, -0.05]].forEach(([x, z], i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), dateM); d.scale.set(1.7, 0.85, 0.85); d.position.set(x, 0.1, z); d.rotation.y = i * 1.3; sack.add(d); }); sack.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); }
  const skin = new THREE.Group(); skin.position.set(-3.9, 0, 2.6); skin.rotation.y = -0.4; scene.add(skin);
  const skinM = new THREE.MeshStandardMaterial({ map: leatherTex, roughness: 0.6 });
  const skinBody = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 16), skinM); skinBody.scale.set(1.5, 0.85, 0.95); skinBody.position.y = 0.42; skinBody.castShadow = true; skin.add(skinBody);
  { const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.5, 12).rotateZ(Math.PI / 2.6), skinM); nk.position.set(0.8, 0.62, 0); nk.castShadow = true; skin.add(nk); }
  const rCr = ringStitch(C.x, C.z, 1.35, 0xc0402c, 26), rSk = ringStitch(-3.8, 0.9, 1.05, 0x8a5a2b, 20), rWs = ringStitch(-3.9, 2.6, 1.05, 0x8a5a2b, 20);

  // ---------- Zamzam
  const poolM = new THREE.MeshStandardMaterial({ map: blueTex, roughness: 0.25, metalness: 0.15, emissive: 0x0b2a66, emissiveIntensity: 0.6 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), poolM); pool.position.set(Z.x, 0.05, Z.z); pool.receiveShadow = true; scene.add(pool);
  const NS = 26, NB = 16;
  const beadM = new THREE.MeshStandardMaterial({ color: 0x4f92f0, emissive: 0x1d5fd0, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.1 });
  const beads = inst(new THREE.SphereGeometry(0.075, 10, 8), beadM, NS * NB + 40, false);
  const SR = mulberry(77), STR = Array.from({ length: NS }, (_, j) => ({ a: (j / NS) * Math.PI * 2 + SR() * 0.2, R: 0.9 + SR() * 0.7, H: 1.6 + SR() * 1.3, ph: SR() })), JET = Array.from({ length: 40 }, () => ({ ph: SR(), r: SR() * 0.12, a: SR() * 6.28 }));
  const ripM = new THREE.MeshBasicMaterial({ color: 0x3a7be0, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const rips = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 72).rotateX(-Math.PI / 2), ripM.clone()); m.position.set(Z.x, 0.06, Z.z); scene.add(m); return m; });
  const arcM = new THREE.MeshStandardMaterial({ map: ochreTex, roughness: 0.5 });
  const arcs = [1, -1].map((sd) => { const g = new THREE.Group(); g.position.set(Z.x, 0, Z.z); scene.add(g); const inner = new THREE.Group(); g.add(inner); const tor = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.27, 12, 56, Math.PI * 0.86).rotateX(-Math.PI / 2), arcM); tor.castShadow = true; inner.add(tor); const a1 = Math.PI * 0.86; for (let i = 0; i < 4; i++) { const a = a1 + 0.02 - i * 0.16, f = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), arcM); f.scale.set(1, 0.9, 1.5); f.position.set(Math.cos(a) * (1.7 + 0.18), 0, -Math.sin(a) * (1.7 + 0.18)); f.castShadow = true; inner.add(f); } g.rotation.y = sd > 0 ? Math.PI / 2 - 0.39 * 1 : -Math.PI / 2 - 0.39; return { g, inner, sd }; });

  // ---------- pilgrims (french knots on the lanes)
  const NPG = 320, PR = mulberry(31);
  const PG = Array.from({ length: NPG }, () => ({ k: (PR() * 7) | 0, sp: 0.035 + PR() * 0.03, ph: PR(), j: (PR() - 0.5) * 0.7 }));
  const pilg = inst(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }), NPG, false);
  { const c = new THREE.Color(); PG.forEach((p, i) => { c.set(PR() < 0.8 ? 0xf7f1e3 : PR() < 0.5 ? 0xd8e4f2 : 0xe9d6b5); pilg.setColorAt(i, c); }); }

  // ---------- barren valley texture: seed stitches + french knots
  { const R = mulberry(41), n1 = 650, n2 = 240, list1 = [], list2 = [];
    const free = (x, z) => Math.hypot(x, z) < 37.5 && !(Math.abs(x) < 2.8 && z > -13.5 && z < 11.5) && Math.hypot(x - C.x, z - C.z) > 3.2 && Math.hypot(x - Z.x, z - Z.z) > 3 && Math.hypot(x - KB.x, z - KB.z) > 2.6 && groundY(x, z) < 0.05;
    while (list1.length < n1) { const x = (R() - 0.5) * 76, z = (R() - 0.5) * 76; if (free(x, z)) list1.push([x, z, R() * 6.28]); }
    while (list2.length < n2) { const x = (R() - 0.5) * 76, z = (R() - 0.5) * 76; if (free(x, z)) list2.push([x, z]); }
    const sm = inst(new THREE.CapsuleGeometry(0.04, 0.22, 2, 6).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), n1, false);
    const kn = inst(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), n2, false);
    const c = new THREE.Color(), P1 = ["#a8865a", "#8b6b47", "#c3a476", "#7a6450"], P2 = ["#8c7b6a", "#a99478", "#6f6255", "#bba27d"];
    list1.forEach(([x, z, a], i) => { te.set(0, a, 0); tm.compose(tv.set(x, 0.04, z), tq.setFromEuler(te), ts.set(1, 1, 1)); sm.setMatrixAt(i, tm); sm.setColorAt(i, c.set(P1[i % 4])); });
    list2.forEach(([x, z], i) => { tm.compose(tv.set(x, 0.05, z), tq.identity(), ts.set(1, 0.6, 1)); kn.setMatrixAt(i, tm); kn.setColorAt(i, c.set(P2[i % 4])); });
  }

  // ---------- stitched labels and the AUDIRA monogram
  const decal = (tex, w, h, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -3 })); m.position.set(x, 0.03, z); m.rotation.y = ry; scene.add(m); return m; };
  const FONT = '700 150px Georgia, "Times New Roman", serif';
  const dShafa = decal(stitchText("SHAFA", "#b8452f", "#6d2416", FONT), 4.2, 1.05, -5.2, 7.6, 88 * deg);
  const dMarwa = decal(stitchText("MARWAH", "#b8452f", "#6d2416", FONT), 4.6, 1.15, -5.0, -9.6, 88 * deg);
  const dZam = decal(stitchText("ZAMZAM", "#2f6fd6", "#173a7a", FONT), 4.0, 1.0, -8.4, -3.7, 42 * deg);
  const audTex = canvasTex(1024, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.font = '700 128px Georgia, serif'; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#2b3a7a"; x.fillText("AUDIRA", w / 2, h / 2 + 6);
    x.globalCompositeOperation = "source-atop"; let c = 0; for (let i = -h; i < w + h; i += 6) { x.strokeStyle = c++ % 2 ? "rgba(255,255,255,.28)" : "rgba(0,0,0,.25)"; x.lineWidth = 3; x.beginPath(); x.moveTo(i, h); x.lineTo(i + h * 0.45, 0); x.stroke(); }
    x.globalCompositeOperation = "source-over"; x.fillStyle = "#e2b65c";
    for (const cx of [90, w - 90]) { x.save(); x.translate(cx, h / 2); x.rotate(Math.PI / 4); x.fillRect(-22, -22, 44, 44); x.restore(); }
    x.setLineDash([14, 9]); x.lineWidth = 5; x.strokeStyle = "#e2b65c"; x.strokeRect(20, 26, w - 40, h - 52);
  });
  const dAud = decal(audTex, 10, 2.5, 27, 4, 24 * deg);
  dAud.material.emissive = new THREE.Color(0xe2b65c); dAud.material.emissiveMap = audTex;

  // ---------- camera: [t, tx, ty, tz, dist, yaw, pitch]
  const s = (k) => K[k];
  const CAMK = track([
    [0, 0, 0.6, -1, 34, 86, 32], [3.4, 0, 0.6, -1, 38, 92, 36], [s("s2") - 0.3, -2, 0.3, -1, 52, 72, 46],
    [s("s2") + 1.6, -5, 0.3, -1, 34, 42, 40], [tMem + 1.1, -10.5, 0, 12, 15, 24, 40], [tIsm + 0.7, -5.8, 0.3, 1.6, 15, 28, 38],
    [A("s2:Ka'bah") + 0.5, -9.5, 0.5, -5.5, 24, 32, 30], [s("s2e") - 0.5, -4, 0, -2, 54, 22, 55],
    [s("s3") + 0.4, -4.8, 0.3, 1.2, 16, 42, 42], [tSed + 0.4, -4.6, 0.3, 1.5, 16, 62, 42], [tBer + 1.6, -5.2, 0.3, -3, 22, 22, 36],
    [tH3 + 3.0, -6.5, 0.3, -8, 32, 18, 40], [tKata + 0.8, -7, 0.3, -9, 42, 60, 52], [s("s3e") - 0.2, -9, 0.3, -14, 46, 130, 54],
    [s("s4") + 1.0, -11.2, 0.5, -19.5, 18, 192, 30], [A("s4:lembah") - 0.6, -9, 0.4, -14, 30, 190, 34], [A("s4:lembah") + 1.3, -6, 0, -6, 50, 186, 44],
    [A("s4:rumah-Mu") + 0.6, -11, 0.6, -8, 26, 184, 30], [s("s4e") - 0.3, -6, 0.3, -1, 30, 150, 36],
    [tAir + 0.6, -4.2, 0.3, 2.2, 11, 124, 40], [tNaik, -3.4, 0.3, 3, 20, 110, 40], [tNaik + 1.6, -0.5, 1.4, 5.5, 22, 96, 36],
    [tLari, 0, 1.0, 2.5, 30, 92, 36], [A("s5:Marwah") + 0.3, 0, 0.8, -1.5, 33, 90, 36], [s("s5e") - 0.2, 0, 0.8, -1, 35, 86, 38],
    [tSua, -1, 0.5, -5, 34, 80, 42], [tPan + 0.3, -6.2, 0.6, -1.2, 16, 64, 34], [tBen + 0.6, -6.4, 0.6, -1.4, 13, 56, 40],
    [tIsi + 0.5, -5.2, 0.5, 0.4, 13, 50, 42], [tZam + 0.2, -7, 0.4, -2.4, 17, 42, 48],
    [tAsal - 0.3, -1, 0.5, -1, 40, 70, 50], [tShafa7, 0, 0.5, -1, 46, 88, 44], [s("s7e") - 0.2, -2, 0.5, -1, 62, 70, 56],
    [s("s8") + 2.6, -1, 0, 4, 110, 40, 64], [A("s8:Kisah"), 0, 0, 11, 185, 26, 72], [s("dur"), 0, 0, 12, 205, 24, 74],
  ]);

  return (t) => {
    // camera
    const [tx, ty, tz, dist, yaw, pit] = CAMK(t);
    const y = yaw * deg, p = pit * deg;
    cam.position.set(tx + dist * Math.cos(p) * Math.sin(y), ty + dist * Math.sin(p), tz + dist * Math.cos(p) * Math.cos(y));
    cam.lookAt(tx, ty, tz);
    const sb = Math.max(14, dist * 0.75);
    sun.position.set(tx + SUN.x * 200, SUN.y * 200, tz + SUN.z * 200); sun.target.position.set(tx, 0, tz);
    SC.left = -sb; SC.right = sb; SC.top = sb; SC.bottom = -sb; SC.updateProjectionMatrix();

    // lanes
    const D = Dt(t);
    for (let i = 0; i < DASH.length; i++) { const d = DASH[i], g = clamp01((D - d.k - d.u) * ND * 0.8); tm.compose(d.p, d.q, ts.set(g, g, g)); lanes.setMatrixAt(i, tm); }
    lanes.instanceMatrix.needsUpdate = true;
    const gk = ramp(t, tAsal, tAsal + 1.4);
    laneM.color.lerpColors(MADDER, GOLD, gk); laneM.emissive.setRGB(0.18 * gk, 0.11 * gk, 0.02 * gk);

    // head, hem ribbon, needle
    H(t, hp); H(t - 0.18, hq);
    dirv.set(hp.x - hq.x, 0, hp.z - hq.z);
    const spd = dirv.length() / 0.18;
    if (spd < 0.05) dirv.set(Math.cos(0.35 * t + 1), 0, Math.sin(0.35 * t + 1)); dirv.normalize();
    perp.set(-dirv.z, 0, dirv.x);
    const ha = hemA(t);
    rib.visible = ha > 0.02;
    if (rib.visible) {
      const pos = ribG.attributes.position, L = (0.95 + Math.min(spd, 8) * 0.22) * ha;
      for (let i = 0; i <= NR; i++) {
        const sI = i / NR, bx = hp.x - dirv.x * sI * L + perp.x * 0.3 * Math.sin(sI * 4 + t * 3.1) * sI, bz = hp.z - dirv.z * sI * L + perp.z * 0.3 * Math.sin(sI * 4 + t * 3.1) * sI;
        const by = groundY(bx, bz) + 0.2 + 0.42 * sI * (0.6 + 0.4 * Math.sin(t * 2.1)) + 0.09 * Math.sin(sI * 9 - t * 7.5), w = 0.46 * (1 - 0.35 * sI) * ha;
        pos.setXYZ(i, bx + perp.x * w * 0.5, by + w * 0.32, bz + perp.z * w * 0.5);
        pos.setXYZ(i + NR + 1, bx - perp.x * w * 0.5, by - w * 0.08, bz - perp.z * w * 0.5);
      }
      pos.needsUpdate = true; ribG.computeVertexNormals();
    }
    const na = Math.max(1 - ramp(t, 3.55, 3.95), ramp(t, tLari - 0.5, tLari) * (1 - ramp(t, lapEnd + 0.1, lapEnd + 0.5)));
    needle.visible = thread.visible = na > 0.02;
    if (needle.visible) {
      const ax = new THREE.Vector3(-dirv.x * 0.55, 1, -dirv.z * 0.55).normalize(), dep = 0.3 * Math.abs(Math.sin(D * ND * Math.PI));
      needle.position.set(hp.x - ax.x * dep, hp.y - ax.y * dep + 0.05, hp.z - ax.z * dep);
      needle.quaternion.setFromUnitVectors(UP, ax); needle.scale.setScalar(na);
      eyeP.copy(needle.position).addScaledVector(ax, 2.65 * na);
      H(Math.max(0, t - 0.12), t1);
      t2.subVectors(t1, eyeP); const len = t2.length();
      thread.position.copy(eyeP).addScaledVector(t2, 0.5); thread.quaternion.setFromUnitVectors(UP, t2.normalize()); thread.scale.set(1, len, 1);
    }

    // footprints
    const fFade = 1 - ramp(t, K.s6 - 0.4, K.s6 + 0.6);
    const prog = { arr: lin(t, tMem, tMem + 2.3), dep: lin(t, tBer, tBer + 8), fol: lin(t, tH3, tH3 + 2.6), app: lin(t, tNaik, tNaik + 1.1), turn: ramp(t, tBer + 8.1, tBer + 8.6) };
    const putF = (L, mesh) => { L.forEach((s0, i) => { const g = clamp01((prog[s0.id] - s0.f) / 0.04) * fFade * (s0.id === "dep" || s0.id === "turn" ? 1 : 1); const k = Math.max(g, 0.0001); te.set(0, s0.psi, 0); tm.compose(tv.set(s0.x, s0.y, s0.z), tq.setFromEuler(te), ts.set(k * s0.mir, k, k)); mesh.setMatrixAt(i, tm); }); mesh.instanceMatrix.needsUpdate = true; };
    putF(HAJ, fpH); putF(IBR, fpI);

    // cradle, sack, skin
    const cA = back(lin(t, tIsm, tIsm + 0.6), 1.4), tr = ramp(t, tBayi, tBayi + 0.4) * (1 - ramp(t, tNaik + 0.8, tNaik + 2));
    cradle.scale.set(Math.max(cA, 1e-4), Math.max(cA, 1e-4) * (1 + 0.04 * Math.sin(t * 2.3)), Math.max(cA, 1e-4)); cradle.rotation.z = 0.035 * tr * Math.sin(t * 31);
    rCr(lin(t, tIsm - 0.1, tIsm + 0.7));
    const sA = back(lin(t, tSek, tSek + 0.55), 1.4); sack.scale.setScalar(Math.max(sA, 1e-4)); rSk(lin(t, tSek - 0.1, tSek + 0.6));
    const wA = back(lin(t, tSed, tSed + 0.55), 1.4), fillv = clamp01(1 - ramp(t, tAir, tAir + 0.9) + ramp(t, tIsi, tIsi + 0.9));
    skin.scale.setScalar(Math.max(wA, 1e-4)); skinBody.scale.set(1.5 * (0.88 + 0.12 * fillv), 0.85 * (0.4 + 0.6 * fillv), 0.95 * (0.85 + 0.15 * fillv)); skinBody.position.y = 0.42 * (0.4 + 0.6 * fillv);
    skinM.color.setRGB(1 - 0.25 * ramp(t, tIsi, tIsi + 0.9), 1 - 0.18 * ramp(t, tIsi, tIsi + 0.9), 1); rWs(lin(t, tSed - 0.1, tSed + 0.6));

    // Zamzam: ripples (the voice), beads, pool, cupping arcs
    rips.forEach((m, i) => { const a = lin(t, tSua + i * 0.35, tSua + i * 0.35 + 1.6); m.visible = a > 0 && a < 1; m.scale.setScalar(0.3 + 3.2 * a); m.material.opacity = 0.85 * (1 - a); });
    const Af = ramp(t, tPan - 0.1, tPan + 0.4), jet = 1 + 1.3 * (1 - ramp(t, tPan + 0.4, tPan + 2.2)), cont = 1 - 0.4 * ramp(t, tBen, tBen + 1.0), late = 1 - 0.35 * ramp(t, K.s8, K.s8 + 2);
    let bi = 0;
    for (let j = 0; j < NS; j++) { const st = STR[j]; for (let b = 0; b < NB; b++) { const ph = (t * 0.8 + b / NB + st.ph) % 1, r = ph * st.R * cont * Af, h = 4 * ph * (1 - ph) * st.H * jet * Af * late, sc = Af > 0.01 ? 1 - 0.5 * ph : 0.0001; tm.compose(tv.set(Z.x + Math.cos(st.a) * r, 0.1 + h, Z.z + Math.sin(st.a) * r), tq.identity(), ts.set(sc, sc, sc)); beads.setMatrixAt(bi++, tm); } }
    for (const jt of JET) { const ph = (t * 1.3 + jt.ph) % 1, sc = Af > 0.01 ? 1.2 - 0.6 * ph : 0.0001; tm.compose(tv.set(Z.x + Math.cos(jt.a) * jt.r, 0.1 + ph * 3.4 * jet * Af * late, Z.z + Math.sin(jt.a) * jt.r), tq.identity(), ts.set(sc, sc, sc)); beads.setMatrixAt(bi++, tm); }
    beads.instanceMatrix.needsUpdate = true;
    const pr = 1.25 * eout(lin(t, tPan, tPan + 1.6)); pool.visible = pr > 0.01; pool.scale.setScalar(Math.max(pr, 1e-3)); pool.rotation.y = t * 0.15;
    const rise = ramp(t, tBen - 0.1, tBen + 0.6), close = ramp(t, tBen + 0.2, tBen + 1.3);
    arcs.forEach(({ g, inner, sd }) => { g.visible = rise > 0.01; inner.scale.set(1, Math.max(rise, 1e-3), 1); g.position.set(Z.x - sd * 1.1 * (1 - close), 0.05, Z.z); g.rotation.y = (sd > 0 ? Math.PI / 2 : -Math.PI / 2) - 0.39 + sd * 0.5 * (1 - close); });

    // pilgrims
    const pa = Math.max(ramp(t, tJut, tJut + 0.8) * (1 - ramp(t, K.s2 - 0.2, K.s2 + 0.6)), ramp(t, K.s7 + 0.6, tAsal + 0.4));
    PG.forEach((g, i) => { const v = (t * g.sp + g.ph) % 2, u = v < 1 ? v : 2 - v; lanePt(g.k, u, tv); tv.x += g.j; tv.y = groundY(tv.x, tv.z) + 0.07; const sc = pa > 0.01 ? pa * (0.85 + 0.3 * ((i * 7) % 5) / 5) : 0.0001; tm.compose(tv, tq.identity(), ts.set(sc, sc * 0.7, sc)); pilg.setMatrixAt(i, tm); });
    pilg.instanceMatrix.needsUpdate = true;

    // labels
    const pulse = 0.5 + 0.5 * ramp(t, tShafa7 - 0.2, tShafa7 + 0.3) * (1 - ramp(t, tShafa7 + 2, tShafa7 + 3));
    dShafa.material.opacity = dMarwa.material.opacity = 0.9; dShafa.scale.setScalar(1 + 0.12 * (pulse - 0.5) * 2); dMarwa.scale.copy(dShafa.scale);
    dZam.material.opacity = ramp(t, tZam - 0.15, tZam + 0.35);
    dAud.material.emissiveIntensity = 0.25 * ramp(t, tAud - 0.2, tAud + 0.3);

    bp.strength = 0.3 + 0.25 * Af; bp.threshold = 0.88;
    comp.render();
  };
}
