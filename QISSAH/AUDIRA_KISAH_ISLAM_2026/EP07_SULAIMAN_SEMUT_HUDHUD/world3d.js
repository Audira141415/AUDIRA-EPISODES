// EP07 SULAIMAN, SEMUT DAN HUD-HUD. WATERCOLOR storybook: soft pigment washes, pencil linework and warm paper, painted
// by a screen-space watercolor pass (wobble, bleed, edge pooling, granulation, graphite edges, paper fibre).
// Two places in one world: the macro ant valley at the origin (ants are 0.6 units long, the army a vast shadow and banners
// far up the road toward +z) and a painted map of the Red Sea lands at X0, where pop-up dioramas stand at Saba and at the
// palace in Syam. A watercolor veil carries the camera between them; a blink carries the throne.
// Nabi Sulaiman never appears: his presence is the banners, the hoofprints, the army's shadow, the royal seal.
// Jinn are not shown. People are faceless silhouettes. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";

const X0 = 20000, MS = 640;
const TH = 0.5515;                                    // heading of the route Saba -> Syam on the map
const mapXZ = (lon, lat) => [X0 + (lon - 43.5) / 27 * MS, -(lat - 23.5) / 27 * MS];
const SABA = mapXZ(45.3, 15.4), PAL = mapXZ(35.2, 31.8);
const CS = Math.cos(TH), SN = Math.sin(TH);
const toW = (O, x, y, z) => [O[0] + x * CS + z * SN, y, O[1] - x * SN + z * CS];
const lerp = (a, b, u) => a + (b - a) * u;
const tmpM = new THREE.Matrix4(), tmpM2 = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpE = new THREE.Euler();
const UP = new THREE.Vector3(0, 1, 0);

// ---------- geometry helpers
function merge(parts) {
  const P = [], N = [], U = [];
  for (const [g0, m] of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    if (m) g.applyMatrix4(m);
    const p = g.attributes.position.array, n = g.attributes.normal.array, uv = g.attributes.uv;
    for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); }
    for (let i = 0; i < g.attributes.position.count; i++) { U.push(uv ? uv.array[i * 2] : 0, uv ? uv.array[i * 2 + 1] : 0); }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
  out.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
  return out;
}
const M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
function cylBetween(a, b, r0, r1 = r0, seg = 6) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, seg);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
  return [g, new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1))];
}
const S = (x, y, z) => new THREE.Vector3(x, y, z);
// faceless robed figure: a lathe robe and a plain head. kind: 0 standing, 1 seated, 2 queen (crown and cape)
function person(kind) {
  const prof = kind === 1
    ? [[0, 0], [0.62, 0], [0.62, 0.35], [0.5, 0.75], [0.34, 1.35], [0.3, 1.75], [0.36, 1.95], [0.2, 2.1], [0, 2.14]]
    : [[0, 0], [0.56, 0], [0.5, 0.55], [0.39, 1.55], [0.3, 2.3], [0.37, 2.55], [0.2, 2.76], [0, 2.8]];
  const lathe = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 14);
  const hy = kind === 1 ? 2.38 : 3.05;
  const parts = [[lathe, null], [new THREE.SphereGeometry(0.27, 14, 10), M4(0, hy, 0)]];
  if (kind === 2) {
    parts.push([new THREE.CylinderGeometry(0.2, 0.25, 0.3, 10, 1, true), M4(0, hy + 0.3, 0)]);
    for (let i = 0; i < 5; i++) parts.push([new THREE.ConeGeometry(0.05, 0.2, 5), M4(Math.cos(i / 5 * 6.283) * 0.2, hy + 0.52, Math.sin(i / 5 * 6.283) * 0.2)]);
    parts.push([new THREE.ConeGeometry(0.62, 2.7, 14, 1, true, Math.PI * 0.25, Math.PI * 1.5), M4(0, hy - 1.25, -0.06, 0, Math.PI, 0)]);
  }
  return merge(parts);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xf2e6cf, fog: 0.008, exp: 1.0, bloom: [0.22, 0.5, 0.93], shadow: true });
  r.toneMapping = THREE.NoToneMapping;
  cam.far = 1800; cam.updateProjectionMatrix();
  scene.add(cam);
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };

  // ---------- timing (all keyed to narration words)
  const tB = A("s1:berteriak"), tM1 = A("s1:memperingatkan"), tS1 = A("s1:tersenyum");
  const tLemb = A("s3:lembah"), tKata = A("s3:berkata"), tWahai = A("s3:wahai"), tMasuk = A("s3:masuklah"), tInjak = A("s3:terinjak"), tSadar = A("s3:menyadari");
  const tSenyum = A("s4:tersenyum"), tDoa = A("s4:berdoa"), tKuasa = A("s4:Kekuasaan");
  const tPeriksa = A("s5:memeriksa"), tHud = A("s5:Hud-hud"), tTak = A("s5:Tak"), tHud2 = A("s5:hud-hud"), CUT1 = A("s5:kabar");
  const tSaba = A("s5:Saba"), tRatu = A("s5:ratu"), tSing = A("s5:singgasana"), tSembah = A("s5:menyembah"), tMata = A("s5:matahari");
  const tSurat = A("s6:surat"), tBuka = A("s6:dibuka"), tBism = A("s6:bismillah"), tSang = A("s6:Sang"), tMusy = A("s6:bermusyawarah"), tHad = A("s6:hadiah"), tTolak = A("s6:menolak"), tAllah6 = A("s6:Allah");
  const tSeb = A("s7:Sebelum"), tPindah = A("s7:memindahkan"), BLINK = A("s7:berkedip") + 0.12, tMasukI = A("s7:masuk"), tKolam = A("s7:kolam"), tTern = A("s7:Ternyata"), tKaca = A("s7:kaca");
  const tSerah = A("s8:berserah"), CUT2 = A("s8:Kekuasaan"), tKalau = A("s8:Kalau");

  // ---------- watercolor textures
  const blotTex = (seed, W, H, base, cols, n, r0, r1, a, repeat, extra) => canvasTex(W, H, (g, w, h) => {
    const q = mulberry(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const x = q() * w, y = q() * h, rr = r0 + q() * r1, c = cols[Math.floor(q() * cols.length)], al = a * (0.4 + 0.6 * q());
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
        const X = x + ox, Y = y + oy;
        if (X + rr < 0 || X - rr > w || Y + rr < 0 || Y - rr > h) continue;
        const gr = g.createRadialGradient(X, Y, rr * 0.1, X, Y, rr);
        gr.addColorStop(0, `rgba(${c},${(al * 0.55).toFixed(3)})`); gr.addColorStop(0.82, `rgba(${c},${al.toFixed(3)})`); gr.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = gr; g.beginPath(); g.arc(X, Y, rr, 0, 7); g.fill();
      }
    }
    if (extra) extra(g, w, h, q);
  }, repeat);
  const lam = (color, map, extra = {}) => new THREE.MeshLambertMaterial({ color, map: map || null, ...extra });

  // ======================================================================= ANT VALLEY (origin)
  const gA = new THREE.Group(); scene.add(gA);
  const groundTex = blotTex(11, 512, 512, "#e9d8b6", ["176,140,92", "150,150,110", "196,160,118", "130,110,86"], 80, 20, 90, 0.12, [70, 70]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), lam(0xffffff, groundTex));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; gA.add(ground);

  const HOLES = [[-3.0, -1.3], [3.1, -0.9], [-1.3, -4.1], [2.1, -4.6], [-5.4, 2.4], [5.1, 2.9], [0.4, 3.7]];
  const vTex = canvasTex(1024, 1024, (g, w, h) => {
    const q = mulberry(5);
    const P = (x, z) => [(x + 40) / 80 * w, (z + 40) / 80 * h];
    for (let i = 0; i < 170; i++) {
      const a = q() * 6.283, rr = Math.pow(q(), 0.6) * 430, x = 512 + Math.cos(a) * rr, y = 512 + Math.sin(a) * rr, s = 20 + q() * 70;
      const c = q() < 0.5 ? "196,158,108" : "168,132,92", al = 0.14 * Math.max(0, 1 - rr / 470);
      const gr = g.createRadialGradient(x, y, s * 0.1, x, y, s);
      gr.addColorStop(0, `rgba(${c},${(al * 0.5).toFixed(3)})`); gr.addColorStop(0.85, `rgba(${c},${al.toFixed(3)})`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
    }
    for (let i = 0; i < 9000; i++) {
      const a = q() * 6.283, rr = Math.pow(q(), 0.55) * 480, x = 512 + Math.cos(a) * rr, y = 512 + Math.sin(a) * rr;
      g.fillStyle = `rgba(${q() < 0.5 ? "105,80,58" : "240,226,198"},${(0.4 * Math.max(0, 1 - rr / 500)).toFixed(3)})`;
      g.fillRect(x, y, 1 + q() * 1.8, 1 + q() * 1.8);
    }
    g.setLineDash([3, 5]); g.lineWidth = 2;
    for (const [hx, hz] of HOLES) {
      const [px, py] = P(hx, hz);
      for (let k = 0; k < 5; k++) {
        const a = q() * 6.283; let x = px, y = py;
        g.strokeStyle = "rgba(115,85,58,.2)"; g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 16; s++) { x += Math.cos(a + (q() - 0.5) * 0.8) * 14; y += Math.sin(a + (q() - 0.5) * 0.8) * 14; g.lineTo(x, y); }
        g.stroke();
      }
    }
    g.setLineDash([]);
  });
  const valley = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), lam(0xffffff, vTex, { transparent: true, depthWrite: false }));
  valley.rotation.x = -Math.PI / 2; valley.position.y = 0.012; valley.receiveShadow = true; valley.renderOrder = 1; gA.add(valley);

  // nest holes: a sand mound and a dark mouth
  const sandTex = blotTex(23, 256, 256, "#d8b984", ["170,130,85", "220,195,150"], 40, 8, 30, 0.25, [2, 2]);
  const moundM = lam(0xffffff, sandTex);
  const holeTex = canvasTex(128, 128, (g, w) => {
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    gr.addColorStop(0, "rgba(38,24,17,1)"); gr.addColorStop(0.5, "rgba(58,38,27,.96)"); gr.addColorStop(0.78, "rgba(110,80,55,.45)"); gr.addColorStop(1, "rgba(110,80,55,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const holeM = new THREE.MeshBasicMaterial({ map: holeTex, transparent: true, depthWrite: false });
  for (const [hx, hz] of HOLES) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.18, 8, 22), moundM);
    m.rotation.x = Math.PI / 2; m.scale.z = 0.55; m.position.set(hx, 0.04, hz); m.castShadow = m.receiveShadow = true; gA.add(m);
    const d = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), holeM);
    d.rotation.x = -Math.PI / 2; d.position.set(hx, 0.07, hz); d.renderOrder = 3; gA.add(d);
  }

  // pebbles
  const rockGeo = (seed) => {
    const g = new THREE.SphereGeometry(1, 40, 28), p = g.attributes.position, q = mulberry(seed), a = [q() * 6, q() * 6, q() * 6];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = 1 + 0.08 * Math.sin(3.1 * x + a[0]) * Math.sin(2.7 * y + a[1]) + 0.06 * Math.sin(5.3 * z + a[2] + x * 2) + 0.025 * Math.sin(9 * y + z * 7);
      p.setXYZ(i, x * n, y * n, z * n);
    }
    g.computeVertexNormals(); return g;
  };
  const stoneTex = blotTex(31, 256, 256, "#b4b6ae", ["90,105,122", "160,135,100", "120,118,125", "200,190,170"], 60, 10, 40, 0.3, [1, 1]);
  const pebG = rockGeo(7);
  let topY = 0;
  { const p = pebG.attributes.position; for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) < 0.12 && Math.abs(p.getZ(i)) < 0.12) topY = Math.max(topY, p.getY(i)); }
  const peb = new THREE.Mesh(pebG, lam(0xffffff, stoneTex));
  peb.scale.set(1.25, 0.7, 1.1); peb.position.y = 0.16; peb.castShadow = peb.receiveShadow = true; gA.add(peb);
  const ANT_Y = 0.16 + 0.7 * topY - 0.02;
  const NR = 80;
  const rocks = new THREE.InstancedMesh(rockGeo(19), lam(0xffffff, stoneTex), NR);
  rocks.castShadow = rocks.receiveShadow = true;
  {
    const q = mulberry(41), rc = [0xc9b79a, 0xa8a69f, 0xd2b08a, 0x9aa2a6, 0xc4a29a];
    for (let i = 0; i < NR; i++) {
      let x, z, ok = false;
      while (!ok) { const a = q() * 6.283, rr = 2.2 + Math.pow(q(), 0.8) * 28; x = Math.cos(a) * rr; z = Math.sin(a) * rr; ok = HOLES.every(([hx, hz]) => Math.hypot(x - hx, z - hz) > 1.1) && !(z < -3 && Math.abs(x) < 3.5 && rr < 13); }
      const s = 0.1 + Math.pow(q(), 2.2) * 0.75;
      rocks.setMatrixAt(i, M4(x, s * 0.25, z, 0, q() * 6, 0, s * (1 + q() * 0.4), s * 0.6, s));
      rocks.setColorAt(i, new THREE.Color(rc[i % rc.length]));
    }
  }
  gA.add(rocks);

  // grass blades and a few flowers: giants at ant scale
  const bladeG = new THREE.PlaneGeometry(0.24, 1, 1, 6);
  { const p = bladeG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 0.5; p.setXYZ(i, p.getX(i) * (1 - y * 0.92), y, 0.28 * y * y); } bladeG.computeVertexNormals(); }
  const NG = 460, grass = new THREE.InstancedMesh(bladeG, lam(0xffffff, null, { side: THREE.DoubleSide }), NG);
  grass.castShadow = true; grass.frustumCulled = false;
  const GR = [];
  {
    const q = mulberry(53), gc = [0x8fa067, 0x6f8a55, 0xa6ad6c, 0x7d9a6a, 0xb7b276];
    while (GR.length < NG) {
      const a = q() * 6.283, rr = 7.5 + Math.pow(q(), 0.7) * 38, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (z < -2 && Math.abs(x) < 10 && rr < 22) continue;
      if (z > 2 && Math.abs(x) < 9 + z * 0.25) continue;
      GR.push({ x, z, h: 1.6 + q() * 4.2 * Math.min(1, rr / 14), yaw: q() * 6.283, lean: (q() - 0.5) * 0.5, ph: q() * 6.283 });
      grass.setColorAt(GR.length - 1, new THREE.Color(gc[Math.floor(q() * gc.length)]));
    }
  }
  gA.add(grass);
  const petalTex = (col) => canvasTex(128, 128, (g, w) => {
    g.clearRect(0, 0, w, w); g.translate(64, 64);
    for (let i = 0; i < 9; i++) { g.rotate(6.283 / 9); const gr = g.createLinearGradient(0, 0, 0, -60); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]); g.fillStyle = gr; g.beginPath(); g.ellipse(0, -34, 11, 28, 0, 0, 7); g.fill(); }
  });
  const FLOW = [[-8.5, 5, 3.8, ["rgba(250,236,236,.95)", "rgba(232,170,180,.9)"]], [7.5, 8, 4.6, ["rgba(252,246,230,.95)", "rgba(245,235,200,.95)"]], [-11.5, -0.5, 3.2, ["rgba(250,220,150,.95)", "rgba(236,170,70,.9)"]],
    [10.5, 1.5, 3.6, ["rgba(250,236,236,.95)", "rgba(220,150,170,.9)"]], [-4.5, 11, 5.2, ["rgba(252,246,230,.95)", "rgba(240,230,190,.95)"]], [3.5, 13, 4.2, ["rgba(250,220,150,.95)", "rgba(236,170,70,.9)"]]];
  const stemM = lam(0x7d9460);
  for (const [x, z, h, col] of FLOW) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 6), stemM); st.position.set(x, h / 2, z); st.castShadow = true; gA.add(st);
    const hd = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshLambertMaterial({ map: petalTex(col), transparent: true, side: THREE.DoubleSide, alphaTest: 0.2 }));
    hd.rotation.x = -Math.PI / 2 + 0.5; hd.position.set(x, h, z); hd.castShadow = true; gA.add(hd);
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), lam(0xe0a83a)); c.position.set(x, h + 0.08, z - 0.04); gA.add(c);
  }

  // ---------- ants
  const antParts = (withAnt = true) => {
    const sp = (sx, sy, sz, x, y, z) => [new THREE.SphereGeometry(1, 12, 9), M4(x, y, z, 0, 0, 0, sx, sy, sz)];
    const P = [sp(0.13, 0.11, 0.19, 0, 0.14, -0.21), sp(0.035, 0.035, 0.05, 0, 0.12, -0.04), sp(0.06, 0.062, 0.12, 0, 0.13, 0.05), sp(0.085, 0.075, 0.08, 0, 0.15, 0.2)];
    for (const s of [-1, 1]) for (const zz of [-0.03, 0.05, 0.12]) {
      const a = S(s * 0.04, 0.12, zz), k = S(s * 0.13, 0.17, zz + (zz - 0.05) * 0.8), f = S(s * 0.22, 0.0, zz + (zz - 0.05) * 2.2);
      P.push(cylBetween(a, k, 0.013, 0.012, 4), cylBetween(k, f, 0.012, 0.008, 4));
    }
    if (withAnt) for (const s of [-1, 1]) P.push(cylBetween(S(s * 0.03, 0.19, 0.25), S(s * 0.07, 0.27, 0.31), 0.009, 0.008, 4), cylBetween(S(s * 0.07, 0.27, 0.31), S(s * 0.11, 0.25, 0.42), 0.008, 0.006, 4));
    return merge(P);
  };
  const antM = lam(0x3b2219);
  const NA = 360, ants = new THREE.InstancedMesh(antParts(), antM, NA);
  ants.castShadow = true; ants.frustumCulled = false; gA.add(ants);
  const ANT = [];
  {
    const q = mulberry(97);
    while (ANT.length < NA) {
      const a = q() * 6.283, rr = 1.7 + Math.pow(q(), 0.75) * 11.5, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (Math.abs(x) < 1.3 && Math.abs(z) < 1.2) continue;
      if (z < -3.5) continue;
      let hb = 0, hd = 1e9;
      HOLES.forEach(([hx, hz], k) => { const d = Math.hypot(x - hx, z - hz); if (d < hd) { hd = d; hb = k; } });
      ANT.push({ x, z, h: hb, d: q(), tr: Math.min(3.9, Math.max(0.6, hd / 3.2)), f1: 0.6 + q() * 0.9, f2: 0.5 + q() * 0.9, p1: q() * 6.283, p2: q() * 6.283, curv: (q() - 0.5) * 1.6, sc: 0.85 + q() * 0.3 });
    }
  }
  // the ant that called: its own body, antennae and front legs that move
  const lead = new THREE.Group(); gA.add(lead);
  const leadBody = new THREE.Group(); lead.add(leadBody);
  const lb = new THREE.Mesh(antParts(false), antM); lb.castShadow = true; leadBody.add(lb);
  const antn = [-1, 1].map((s) => {
    const pv = new THREE.Group(); pv.position.set(s * 0.03, 0.19, 0.25); leadBody.add(pv);
    const [g1, m1] = cylBetween(S(0, 0, 0), S(s * 0.04, 0.08, 0.06), 0.009, 0.008, 4);
    const [g2, m2] = cylBetween(S(s * 0.04, 0.08, 0.06), S(s * 0.08, 0.06, 0.18), 0.008, 0.006, 4);
    pv.add(new THREE.Mesh(merge([[g1, m1], [g2, m2]]), antM));
    return pv;
  });
  lead.position.set(0, ANT_Y, 0);
  // call rings: pencil circles that spread from the caller
  const ringM = new THREE.MeshBasicMaterial({ color: 0x5a3b2a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const RINGS = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 64), ringM.clone()); m.renderOrder = 5; gA.add(m); return m; });

  // ---------- the army's long shadow with banner-pole shadows leading it
  const shTex = canvasTex(1024, 1024, (g, w, h) => {
    const q = mulberry(61);
    g.clearRect(0, 0, w, h);
    const body = g.createLinearGradient(0, 90, 0, 420);
    body.addColorStop(0, "rgba(58,52,82,0)"); body.addColorStop(0.35, "rgba(58,52,82,.55)"); body.addColorStop(1, "rgba(58,52,82,.72)");
    g.fillStyle = body; g.fillRect(0, 90, w, h);
    for (let i = 0; i < 70; i++) { const x = q() * w, y = 100 + q() * 120, rr = 30 + q() * 60; const gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, "rgba(58,52,82,.35)"); gr.addColorStop(1, "rgba(58,52,82,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    for (let i = 0; i < 9; i++) {           // pole shadows reach ahead, a flag at each tip
      const x = 120 + i * 98 + (q() - 0.5) * 30, y0 = 6 + q() * 40;
      g.strokeStyle = "rgba(52,46,76,.6)"; g.lineWidth = 5 + q() * 3; g.beginPath(); g.moveTo(x, 200); g.lineTo(x + (q() - 0.5) * 8, y0); g.stroke();
      g.fillStyle = "rgba(52,46,76,.55)"; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 46, y0 + 6 + q() * 6); g.lineTo(x + 40, y0 + 30); g.lineTo(x, y0 + 26); g.fill();
    }
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 4; gA.add(shadow);
  const hoofTex = canvasTex(256, 256, (g, w) => {
    g.clearRect(0, 0, w, w);
    g.lineCap = "round";
    g.strokeStyle = "rgba(90,66,48,.75)"; g.lineWidth = 44; g.beginPath(); g.arc(128, 120, 70, Math.PI * 0.05, Math.PI * 0.95, true); g.stroke();
    g.strokeStyle = "rgba(60,42,32,.85)"; g.lineWidth = 22; g.beginPath(); g.arc(128, 120, 70, Math.PI * 0.08, Math.PI * 0.92, true); g.stroke();
    g.strokeStyle = "rgba(245,230,200,.6)"; g.lineWidth = 6; g.beginPath(); g.arc(128, 120, 98, Math.PI * 0.07, Math.PI * 0.93, true); g.stroke();
  });
  const HOOF = [];
  { const q = mulberry(71); for (let k = 0; k < 12; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), new THREE.MeshBasicMaterial({ map: hoofTex, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = (q() - 0.5) * 0.3; const z = 30 + k * 6.6; m.position.set((k % 2 ? 3.6 : -3.6) + (q() - 0.5) * 2, 0.05, z); m.renderOrder = 3; gA.add(m); HOOF.push({ m, z }); } }
  const dust = pts(gA, 320, { color: 0xc49c6a, size: 2.6, add: false, opacity: 0.32 });
  const dseed = []; { const q = mulberry(81); for (let i = 0; i < 320; i++) dseed.push([q(), q(), q(), q()]); }

  // ---------- the army on the road (far, faceless): ranks, banners, birds in formation
  const figM = lam(0xffffff);
  const NF = 9 * 22, figs = new THREE.InstancedMesh(person(0), figM, NF);
  figs.castShadow = true; figs.frustumCulled = false; gA.add(figs);
  const FIG = [];
  { const q = mulberry(91), fc = [0x3b3652, 0x55402f, 0x3e4c60, 0x62452f, 0x2f3646];
    for (let rr = 0; rr < 22; rr++) for (let c = 0; c < 9; c++) { FIG.push({ x: (c - 4) * 24 + (q() - 0.5) * 3, r: rr, dz: (q() - 0.5) * 3 }); figs.setColorAt(FIG.length - 1, new THREE.Color(fc[(rr + c) % fc.length])); } }
  const poleG = new THREE.CylinderGeometry(0.6, 0.7, 1, 6); poleG.translate(0, 0.5, 0);
  const flagG = new THREE.PlaneGeometry(1, 1, 8, 1); flagG.translate(0.5, 0, 0);
  const flagTex = canvasTex(256, 160, (g, w, h) => {
    const q = mulberry(13);
    g.fillStyle = "#f4ead8"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { const x = q() * w, y = q() * h, rr = 10 + q() * 40; const gr = g.createRadialGradient(x, y, 1, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.4)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    g.fillStyle = "rgba(255,248,230,.9)"; g.fillRect(0, h * 0.42, w, h * 0.16);
    g.strokeStyle = "rgba(255,250,235,.95)"; g.lineWidth = 7; g.beginPath(); g.arc(w * 0.55, h * 0.5, 34, 0, 7); g.stroke();
    g.strokeStyle = "rgba(60,40,30,.45)"; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
  });
  const NBAN = 25;
  const poles = new THREE.InstancedMesh(poleG, lam(0x6b4a33), NBAN), flags = new THREE.InstancedMesh(flagG, lam(0xffffff, flagTex, { side: THREE.DoubleSide }), NBAN);
  poles.frustumCulled = flags.frustumCulled = false; poles.castShadow = flags.castShadow = true; gA.add(poles, flags);
  const BAN = [];
  { const bc = [0xb8483a, 0xd29a3a, 0x3f7f86, 0x4b4f8a, 0xc06a3c]; let k = 0;
    for (const rr of [0, 5, 10, 15, 20]) for (const c of [0, 2, 4, 6, 8]) { BAN.push({ x: (c - 4) * 24 + 4, r: rr, ph: k * 1.3 }); flags.setColorAt(k, new THREE.Color(bc[k % bc.length])); k++; } }

  // birds (instanced body + two wings): 33 above the army in s2, 10 in the V over the valley in s5
  const birdBody = merge([[new THREE.SphereGeometry(1, 10, 8), M4(0, 0, 0, 0, 0, 0, 0.13, 0.11, 0.36)], [new THREE.SphereGeometry(0.1, 8, 6), M4(0, 0.04, 0.33)], [new THREE.ConeGeometry(0.13, 0.32, 4), M4(0, 0, -0.42, -Math.PI / 2, 0, 0, 1, 1, 0.3)]]);
  const wingG = new THREE.PlaneGeometry(1, 0.42, 4, 1); wingG.translate(0.5, 0, 0); wingG.rotateX(-Math.PI / 2);
  { const p = wingG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) * (1 - 0.55 * x) - 0.12 * x); } }
  const NBI = 43, birdM = lam(0xffffff, null, { side: THREE.DoubleSide });
  const bBody = new THREE.InstancedMesh(birdBody, birdM, NBI), bWL = new THREE.InstancedMesh(wingG, birdM, NBI), bWR = new THREE.InstancedMesh(wingG, birdM, NBI);
  for (const m of [bBody, bWL, bWR]) { m.frustumCulled = false; m.castShadow = true; scene.add(m); }
  { const q = mulberry(17), bc = [0x5d6f86, 0x8a6a55, 0x6d7b7f, 0x9d8a74, 0x4d5872];
    for (let i = 0; i < NBI; i++) { const c = new THREE.Color(bc[Math.floor(q() * bc.length)]); bBody.setColorAt(i, c); bWL.setColorAt(i, c); bWR.setColorAt(i, c); } }
  const mirX = new THREE.Matrix4().makeScale(-1, 1, 1);
  const setBird = (i, x, y, z, yaw, bank, flap, s) => {
    tmpM.compose(tmpP.set(x, y, z), tmpQ.setFromEuler(tmpE.set(0, yaw, bank, "YXZ")), tmpS.setScalar(s));
    bBody.setMatrixAt(i, tmpM);
    tmpM2.makeRotationZ(flap); bWR.setMatrixAt(i, tmpM2.premultiply(tmpM));
    tmpM2.makeRotationZ(flap).premultiply(mirX).premultiply(tmpM); bWL.setMatrixAt(i, tmpM2);
  };
  const slotTex = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(70,50,40,.9)"; g.lineWidth = 9; g.setLineDash([16, 14]); g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke(); });
  const slot = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: slotTex, transparent: true, depthWrite: false, opacity: 0, fog: false }));
  slot.renderOrder = 6; gA.add(slot);

  // ======================================================================= THE HOOPOE (hud-hud)
  const hoopoe = new THREE.Group(); scene.add(hoopoe);
  const cinn = lam(0xd38a56), cinnL = lam(0xe2a272), blackM = lam(0x2a2320);
  const wingTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "#1f1b1a"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#d9905e"; g.fillRect(0, 0, w * 0.16, h);
    g.fillStyle = "#f4efe6"; for (let i = 0; i < 5; i++) g.fillRect(w * (0.24 + i * 0.15), 0, w * 0.06, h);
  });
  const tailTex = canvasTex(64, 128, (g, w, h) => { g.fillStyle = "#1f1b1a"; g.fillRect(0, 0, w, h); g.fillStyle = "#f4efe6"; g.fillRect(0, h * 0.42, w, h * 0.14); });
  const hb = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), cinn); hb.scale.set(0.3, 0.28, 0.55); hoopoe.add(hb);
  const hbelly = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), cinnL); hbelly.scale.set(0.26, 0.2, 0.42); hbelly.position.set(0, -0.08, 0.06); hoopoe.add(hbelly);
  const hh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), cinn); hh.position.set(0, 0.2, 0.5); hoopoe.add(hh);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), blackM); e.position.set(s * 0.15, 0.25, 0.6); hoopoe.add(e); }
  const beak = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(S(0, 0.17, 0.66), S(0, 0.17, 0.95), S(0, 0.02, 1.18)), 12, 0.026, 6), blackM); hoopoe.add(beak);
  const crest = [];
  for (let i = 0; i < 8; i++) {
    const pv = new THREE.Group(); pv.position.set(0, 0.36, 0.46 - i * 0.02); hoopoe.add(pv);
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.44, 6), lam(0xe39a4e)); f.position.y = 0.22; f.scale.z = 0.45; pv.add(f);
    const tp = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), blackM); tp.position.y = 0.42; tp.scale.z = 0.45; pv.add(tp);
    crest.push(pv);
  }
  const hwG = new THREE.PlaneGeometry(1.15, 0.52, 6, 2); hwG.translate(0.575, 0, 0); hwG.rotateX(-Math.PI / 2);
  { const p = hwG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), k = x / 1.15; p.setZ(i, p.getZ(i) * (1 - 0.35 * k * k) - 0.06 * k); } hwG.computeVertexNormals(); }
  const hwM = lam(0xffffff, wingTex, { side: THREE.DoubleSide });
  const hWings = [-1, 1].map((s) => { const pv = new THREE.Group(); pv.position.set(s * 0.22, 0.12, 0.05); pv.scale.x = s; hoopoe.add(pv); const m = new THREE.Mesh(hwG, hwM); m.castShadow = true; pv.add(m); return pv; });
  const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.66), lam(0xffffff, tailTex, { side: THREE.DoubleSide })); tail.rotation.x = -Math.PI / 2; tail.position.set(0, 0.03, -0.86); hoopoe.add(tail);
  hoopoe.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  // ======================================================================= THE MAP (X0) with pop-up dioramas
  const gM = new THREE.Group(); scene.add(gM);
  const deskTex = blotTex(101, 512, 512, "#d8c59f", ["160,130,90", "190,165,125", "140,120,95"], 70, 30, 110, 0.12, [10, 10]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), lam(0xffffff, deskTex));
  desk.rotation.x = -Math.PI / 2; desk.position.set(X0, -0.6, 0); desk.receiveShadow = true; gM.add(desk);
  const mapTex = canvasTex(2048, 2048, (g, w, h) => {
    const q = mulberry(303);
    const P = (lon, lat) => [(lon - 30) / 27 * w, (37 - lat) / 27 * h];
    g.fillStyle = "#ead7b1"; g.fillRect(0, 0, w, h);
    const blot = (x, y, rr, c, al) => { const gr = g.createRadialGradient(x, y, rr * 0.1, x, y, rr); gr.addColorStop(0, `rgba(${c},${al * 0.55})`); gr.addColorStop(0.82, `rgba(${c},${al})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); };
    for (let i = 0; i < 260; i++) blot(q() * w, q() * h, 30 + q() * 120, q() < 0.6 ? "205,165,105" : "180,140,95", 0.13);
    for (const [lon, lat, rr] of [[35.6, 33.4, 160], [36.5, 34.8, 140], [44.2, 15.2, 170], [43.4, 13.8, 120], [45.3, 15.4, 110]]) { const [x, y] = P(lon, lat); for (let k = 0; k < 10; k++) blot(x + (q() - 0.5) * rr, y + (q() - 0.5) * rr, rr * (0.3 + q() * 0.5), "120,150,95", 0.16); }
    const poly = (pts) => { g.beginPath(); pts.forEach(([lon, lat], i) => { const [x, y] = P(lon, lat); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    const MED = [[29.5, 37.5], [29.5, 31.2], [31, 31.6], [32.3, 31.3], [33.5, 31.1], [34.2, 31.3], [34.9, 32.5], [35.0, 33.3], [35.5, 34.2], [35.9, 35.2], [35.8, 36.0], [36.2, 36.6], [35.5, 36.6], [34.5, 36.8], [32.5, 36.1], [31, 36.8], [29.5, 37.5]];
    const RED = [[32.55, 29.95], [32.7, 29.2], [33.2, 28.4], [33.8, 27.4], [34.2, 26.3], [35.0, 24.5], [35.7, 23.2], [36.9, 21.8], [37.3, 20.5], [37.9, 18.6], [38.6, 17.6], [39.3, 15.9], [40.1, 15.2], [41.2, 14.1], [42.4, 13.0], [43.2, 12.0],
      [44.0, 10.5], [45.5, 10.7], [47.5, 11.1], [49.5, 11.4], [51.2, 11.9], [51.3, 10.4], [51.0, 9.5], [57.5, 9.5], [57.5, 18.7], [56.8, 18.6], [55.5, 17.6], [54.0, 17.0], [52.2, 15.7], [51.2, 15.2], [48.7, 14.0], [46.5, 13.4], [45.0, 12.8], [43.5, 12.7],
      [43.0, 13.6], [42.7, 15.0], [42.6, 16.4], [41.5, 18.0], [40.5, 19.5], [39.2, 21.4], [38.6, 23.0], [37.4, 24.6], [36.5, 25.8], [35.4, 27.4], [34.9, 28.4], [35.0, 29.5], [34.75, 29.1], [34.5, 28.3], [34.25, 27.73], [33.6, 28.3], [33.1, 28.9]];
    const GULF = [[47.8, 30.2], [48.9, 30.4], [50.2, 29.9], [50.8, 28.8], [51.6, 27.8], [53.7, 26.7], [54.8, 26.5], [56.3, 27.1], [57.5, 26.0], [57.5, 24.5], [56.4, 24.9], [56.1, 26.0], [55.5, 25.3], [54.5, 24.2], [53.0, 24.1], [51.6, 24.2], [51.3, 25.7], [50.8, 25.6], [50.5, 26.3], [50.0, 26.6], [49.6, 27.1], [48.9, 27.6], [48.4, 28.4]];
    for (const SEA of [MED, RED, GULF]) {
      poly(SEA); g.fillStyle = "rgba(120,160,184,.62)"; g.fill();
      g.save(); poly(SEA); g.clip(); for (let i = 0; i < 90; i++) blot(q() * w, q() * h, 40 + q() * 120, q() < 0.5 ? "70,115,150" : "150,190,200", 0.16); g.restore();
      g.save(); g.filter = "blur(7px)"; poly(SEA); g.strokeStyle = "rgba(55,95,130,.55)"; g.lineWidth = 16; g.stroke(); g.restore();
      poly(SEA); g.strokeStyle = "rgba(70,58,46,.75)"; g.lineWidth = 2.6; g.stroke();
    }
    poly([[32.3, 35.0], [33.0, 35.4], [34.6, 35.7], [34.0, 35.0], [33.0, 34.6]]); g.fillStyle = "#e3cda3"; g.fill(); g.strokeStyle = "rgba(70,58,46,.75)"; g.lineWidth = 2.4; g.stroke();
    g.strokeStyle = "rgba(70,95,120,.35)"; g.lineWidth = 2;                       // sea squiggles
    for (let i = 0; i < 70; i++) { const lon = 36 + q() * 21, lat = 10 + q() * 12; const [x, y] = P(lon, lat); const d = g.getImageData(x | 0, y | 0, 1, 1).data; if (d[2] > d[0]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 9, y - 6, x + 18, y); g.quadraticCurveTo(x + 27, y + 6, x + 36, y); g.stroke(); } }
    g.strokeStyle = "rgba(85,62,44,.55)"; g.lineWidth = 2.2;                       // mountains of the Hijaz and Yemen
    for (let i = 0; i < 90; i++) { const u = q(); const lon = lerp(36.0, 44.2, u) + (q() - 0.5) * 0.9, lat = lerp(28.5, 14.2, u) + (q() - 0.5) * 0.8; const [x, y] = P(lon, lat); const s = 10 + q() * 10; g.beginPath(); g.moveTo(x - s, y + s * 0.6); g.lineTo(x, y - s * 0.6); g.lineTo(x + s, y + s * 0.6); g.stroke(); }
    for (let i = 0; i < 1600; i++) { const x = q() * w, y = q() * h; g.fillStyle = `rgba(110,85,60,${(q() * 0.25).toFixed(2)})`; g.fillRect(x, y, 2, 2); }
    // the road between Syam and Saba
    const ROUTE = [[35.2, 31.8], [36.0, 30.2], [37.4, 28.3], [38.3, 26.6], [39.6, 24.5], [40.6, 22.0], [41.8, 19.6], [43.3, 17.8], [44.4, 16.6], [45.3, 15.4]];
    g.setLineDash([16, 14]); g.lineCap = "round"; g.strokeStyle = "rgba(150,58,40,.8)"; g.lineWidth = 6;
    g.beginPath(); ROUTE.forEach(([lon, lat], i) => { const [x, y] = P(lon, lat); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke(); g.setLineDash([]);
    g.font = "italic 700 74px Georgia, serif"; g.fillStyle = "rgba(92,52,36,.85)"; { const [x, y] = P(47.6, 13.0); g.fillText("Saba", x, y); }
    { const [cx, cy] = P(53.8, 33.6); g.strokeStyle = "rgba(85,62,44,.7)"; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 70, 0, 7); g.stroke();
      g.fillStyle = "rgba(150,58,40,.75)"; g.beginPath(); g.moveTo(cx, cy - 110); g.lineTo(cx + 16, cy); g.lineTo(cx, cy + 110); g.lineTo(cx - 16, cy); g.fill();
      g.fillStyle = "rgba(85,62,44,.6)"; g.beginPath(); g.moveTo(cx - 110, cy); g.lineTo(cx, cy + 16); g.lineTo(cx + 110, cy); g.lineTo(cx, cy - 16); g.fill(); }
    const vg = g.createRadialGradient(w / 2, h / 2, w * 0.38, w / 2, h / 2, w * 0.72); vg.addColorStop(0, "rgba(120,80,40,0)"); vg.addColorStop(1, "rgba(120,80,40,.35)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  });
  const mapM = lam(0xffffff, mapTex);
  const map = new THREE.Mesh(new THREE.PlaneGeometry(MS, MS), mapM);
  map.rotation.x = -Math.PI / 2; map.position.set(X0, 0, 0); map.receiveShadow = true; gM.add(map);

  // shared diorama materials (watercolor textured lambert)
  const stoneT = blotTex(201, 256, 256, "#eadbbd", ["190,160,115", "160,140,120", "220,205,175"], 50, 10, 40, 0.28, [1, 1]);
  const marbleT = blotTex(211, 256, 256, "#f0ebe2", ["170,180,195", "210,200,185"], 40, 10, 40, 0.25, [1, 1]);
  const limeM = lam(0xffffff, stoneT), marbleM = lam(0xffffff, marbleT);
  const ochreM = lam(0xe2c08c, stoneT), goldM = lam(0xd9a441, null, { emissive: 0x3a2400 }), plumM = lam(0x4a3552), lapisM = lam(0x3e5c8a), redM = lam(0xa63c33);
  const sunM = new THREE.MeshLambertMaterial({ color: 0xe7b14a, emissive: 0x000000 });
  const palmTrunk = lam(0x8a6a48), palmLeaf = lam(0x6f8a4f, null, { side: THREE.DoubleSide });
  const pop = (p) => { const s = Math.min(1, Math.max(0, p) * 3); return [-(Math.PI / 2) * (1 - p), Math.max(0.0001, s)]; };
  const hinge = (parent, x, y, z) => { const h = new THREE.Group(); h.position.set(x, y, z); parent.add(h); return h; };
  const palm = (parent, x, z, hgt) => {
    const hg = hinge(parent, x, 1, z);
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.42 - i * 0.03, 0.48 - i * 0.03, hgt / 6, 7), palmTrunk); c.position.set(i * 0.12, hgt / 12 + i * hgt / 6, 0); c.castShadow = true; hg.add(c); }
    for (let i = 0; i < 8; i++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.7, 5.2, 4, 1, true), palmLeaf); lf.scale.z = 0.25; const a = i / 8 * 6.283; lf.position.set(0.7 + Math.cos(a) * 2.2, hgt + 0.3 - 0.6, Math.sin(a) * 2.2); lf.rotation.set(Math.sin(a) * 1.25, -a, -Math.cos(a) * 1.25); lf.castShadow = true; hg.add(lf); }
    return hg;
  };
  function makeThrone(mats) {
    const T = new THREE.Group();
    const add = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; o.castShadow = o.receiveShadow = true; T.add(o); return o; };
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(0.7, 3.4, 0.7), mats.gold, sx * 2.3, 1.7, sz * 1.9);
    add(new THREE.BoxGeometry(5.6, 1.0, 4.6), mats.gold, 0, 3.6, 0);
    add(new THREE.BoxGeometry(5.0, 0.7, 4.0), mats.red, 0, 4.4, -0.1);
    add(new THREE.BoxGeometry(5.6, 7.2, 0.8), mats.gold, 0, 7.4, 2.0);
    add(new THREE.BoxGeometry(4.4, 5.6, 0.3), mats.red, 0, 7.4, 1.55);
    const arch = add(new THREE.CylinderGeometry(2.8, 2.8, 0.8, 24, 1, false, -Math.PI / 2, Math.PI), mats.gold, 0, 11.0, 2.0, Math.PI / 2);
    arch.rotation.set(Math.PI / 2, 0, 0);
    for (const sx of [-1, 1]) { add(new THREE.BoxGeometry(0.7, 1.6, 4.2), mats.gold, sx * 2.6, 5.0, -0.1); add(new THREE.SphereGeometry(0.42, 12, 10), mats.gold, sx * 2.6, 6.0, -2.0); }
    const gems = [0xb3243a, 0x2f8a63, 0x2f4fa3];
    for (let i = 0; i < 7; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mats.gem[i % 3] || lam(gems[i % 3], null, { emissive: gems[i % 3], emissiveIntensity: 0.25 })); g.position.set(Math.cos(Math.PI * (0.1 + i * 0.133)) * 2.2, 11.0 + Math.sin(Math.PI * (0.1 + i * 0.133)) * 2.2, 1.55); T.add(g); }
    return T;
  }

  // ---------- SABA diorama (local frame: front faces -z, toward the road north)
  const gS = new THREE.Group(); gS.position.set(SABA[0], 0, SABA[1]); gS.rotation.y = TH; gM.add(gS);
  const slabS = new THREE.Mesh(new THREE.BoxGeometry(64, 1, 62), ochreM); slabS.position.y = 0.5; slabS.receiveShadow = slabS.castShadow = true; gS.add(slabS);
  const temple = hinge(gS, 2, 1, 22);
  { const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; temple.add(o); return o; };
    add(new THREE.BoxGeometry(30, 1.4, 16), limeM, 0, 0.7, 0); add(new THREE.BoxGeometry(27, 1.4, 13.5), limeM, 0, 2.1, 0.4); add(new THREE.BoxGeometry(24, 1.4, 11), limeM, 0, 3.5, 0.8);
    for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(1.6, 15, 1.6), limeM, -9.5 + i * 3.8, 11.7, -3.2);
    add(new THREE.BoxGeometry(22, 12, 1.2), lam(0xd9c39a, stoneT), 0, 10.2, 4.5);
    add(new THREE.BoxGeometry(23.6, 1.6, 9.6), limeM, 0, 20.0, 0.6);
  }
  const sunDisk = new THREE.Group(); sunDisk.position.set(0, 25.6, -3.4); temple.add(sunDisk);
  { const d = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.6, 32), sunM); d.rotation.x = Math.PI / 2; d.castShadow = true; sunDisk.add(d);
    for (let i = 0; i < 12; i++) { const ray = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.2, 4), sunM); const a = i / 12 * 6.283; ray.position.set(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 0); ray.rotation.z = a - Math.PI / 2; ray.scale.z = 0.3; sunDisk.add(ray); } }
  const thrMatS = { gold: goldM.clone(), red: redM.clone(), gem: [0xb3243a, 0x2f8a63, 0x2f4fa3].map((c) => lam(c, null, { emissive: c, emissiveIntensity: 0.25 })) };
  const throneS = hinge(gS, -14, 1, -2);
  const daisS = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 8), lapisM); daisS.position.y = 0.6; daisS.castShadow = daisS.receiveShadow = true; throneS.add(daisS);
  const thrS = makeThrone(thrMatS); thrS.position.y = 1.2; thrS.rotation.y = Math.PI; throneS.add(thrS);
  const thrSMats = [thrMatS.gold, thrMatS.red, ...thrMatS.gem]; thrSMats.forEach((m) => { m.transparent = true; });
  const queenG = person(2);
  const queenS = new THREE.Mesh(queenG, plumM); queenS.castShadow = true; queenS.scale.setScalar(1.45); gS.add(queenS);
  const WORS = [];
  { const wG = person(0), wM = lam(0x6a4a3e); for (let rr = 0; rr < 3; rr++) for (let c = 0; c < 6; c++) { const h = hinge(gS, 7 + c * 2.7, 1, -15 + rr * 3.6); const m = new THREE.Mesh(wG, wM); m.castShadow = true; h.add(m); WORS.push({ h, m, k: rr * 6 + c }); } }
  const council = hinge(gS, -12, 1, -24);
  const COUN = [];
  { const tb = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.2, 1.2, 24), lam(0x8a5a3c)); tb.position.y = 0.6; tb.castShadow = tb.receiveShadow = true; council.add(tb);
    const cG = person(1), cM = lam(0x5a4a5e);
    for (let i = 0; i < 7; i++) { const a = Math.PI * 0.5 + (i + 1) / 8 * 6.283; const m = new THREE.Mesh(cG, cM); m.position.set(Math.cos(a) * 5.6, 0, Math.sin(a) * 5.6); m.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); m.scale.setScalar(1.35); m.castShadow = true; council.add(m); COUN.push(m); } }
  const PALMS_S = [palm(gS, -27, 24, 13), palm(gS, 27, 25, 15), palm(gS, -28, -26, 12), palm(gS, 28, -22, 14)];
  // the scroll with its seal, the gifts, the seal stamp on the road, the queen's procession
  const parchT = canvasTex(256, 512, (g, w, h) => {
    const q = mulberry(7); g.fillStyle = "#f1e2bf"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const x = q() * w, y = q() * h, rr = 10 + q() * 50; const gr = g.createRadialGradient(x, y, 1, x, y, rr); gr.addColorStop(0, "rgba(190,150,90,.18)"); gr.addColorStop(1, "rgba(190,150,90,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    g.strokeStyle = "rgba(176,128,52,.85)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 2; g.strokeRect(24, 24, w - 48, h - 48);
    g.strokeStyle = "rgba(60,48,40,.55)"; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const y = 120 + i * 38; g.beginPath(); g.moveTo(w - 50, y); for (let x = w - 50; x > 50 + (i === 8 ? 90 : 0); x -= 12) g.lineTo(x, y + Math.sin(x * 0.3 + i) * 3); g.stroke(); }
  });
  const scroll = new THREE.Group(); gS.add(scroll);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 2.6, 16), lam(0xead7b0, stoneT)); roll.rotation.z = Math.PI / 2; roll.castShadow = true; scroll.add(roll);
  const waxSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.14, 18), lam(0xa82c26, null, { emissive: 0x200000 })); scroll.add(waxSeal);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1), lam(0xffffff, parchT, { side: THREE.DoubleSide })); sheet.rotation.x = -Math.PI / 2; sheet.receiveShadow = true; gS.add(sheet);
  const chestT = blotTex(221, 128, 128, "#8b4a2c", ["120,60,35", "160,90,50"], 20, 6, 20, 0.35, [1, 1]);
  const CHESTS = [0, 1, 2].map(() => {
    const c = new THREE.Group(); gS.add(c);
    const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; c.add(o); return o; };
    add(new THREE.BoxGeometry(2.4, 1.4, 1.6), lam(0xffffff, chestT), 0, 0.7, 0);
    const lid = add(new THREE.CylinderGeometry(0.8, 0.8, 2.4, 14, 1, false, 0, Math.PI), lam(0xffffff, chestT), 0, 1.4, 0); lid.rotation.z = Math.PI / 2;
    for (const x of [-0.9, 0, 0.9]) { add(new THREE.BoxGeometry(0.18, 1.45, 1.66), goldM, x, 0.72, 0); const b = add(new THREE.CylinderGeometry(0.83, 0.83, 0.18, 14, 1, false, 0, Math.PI), goldM, x, 1.4, 0); b.rotation.z = Math.PI / 2; }
    return c;
  });
  const stampT = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#d4a13f"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "rgba(120,80,20,.8)"; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 110, 0, 7); g.stroke(); g.lineWidth = 4; g.beginPath(); g.arc(128, 128, 88, 0, 7); g.stroke();
    g.fillStyle = "rgba(120,80,20,.75)"; for (let i = 0; i < 8; i++) { g.save(); g.translate(128, 128); g.rotate(i / 8 * 6.283); g.beginPath(); g.ellipse(0, -42, 13, 34, 0, 0, 7); g.fill(); g.restore(); }
    g.beginPath(); g.arc(128, 128, 14, 0, 7); g.fill();
  });
  const sealStamp = new THREE.Group(); gS.add(sealStamp);
  { const top = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9, 1.4, 40), [goldM, lam(0xffffff, stampT, { emissive: 0x2a1a00 }), goldM]); top.castShadow = true; sealStamp.add(top);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(2.2, 18, 12), goldM); knob.position.y = 1.6; knob.scale.y = 0.6; sealStamp.add(knob); }
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: 0xa8702a, transparent: true, opacity: 0, depthWrite: false })); shock.rotation.x = -Math.PI / 2; shock.renderOrder = 4; gS.add(shock);
  const procG = person(0), procM = lam(0x5c4658);
  const PROC = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(procG, procM); m.castShadow = true; gS.add(m); PROC.push(m); }
  // light streak (the throne carried before an eye can blink) and its sparkle
  const streakCurve = new THREE.CatmullRomCurve3([S(-14, 8, -2), S(-16, 20, -30), S(-20, 26, -90), S(-26, 28, -170), S(-34, 26, -280)]);
  const streak = new THREE.Mesh(new THREE.TubeGeometry(streakCurve, 160, 0.9, 6, false), new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  streak.renderOrder = 7; gS.add(streak);
  const spark = pts(scene, 420, { color: 0xffd98a, size: 0.55, add: true, opacity: 0.95 });
  const kseed = []; { const q = mulberry(333); for (let i = 0; i < 420; i++) kseed.push([q(), q(), q(), q()]); }

  // ---------- PALACE diorama in Syam (local +z points down the road to Saba)
  const gP = new THREE.Group(); gP.position.set(PAL[0], 0, PAL[1]); gP.rotation.y = TH; gM.add(gP);
  const tileT = canvasTex(256, 256, (g, w) => {
    const q = mulberry(404); g.fillStyle = "#dfe7e4"; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? `rgba(70,130,150,${0.35 + q() * 0.2})` : `rgba(220,200,160,${0.3 + q() * 0.2})`; g.fillRect(i * 32 + 2, j * 32 + 2, 28, 28); }
  }, [3, 3]);
  const frameM = lam(0xffffff, marbleT);
  { const add = (w, h, d, x, y, z, m = frameM) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; gP.add(o); return o; };
    add(58, 4, 14, 0, 2, -18); add(58, 4, 14, 0, 2, 18); add(15, 4, 22, -21.5, 2, 0); add(15, 4, 22, 21.5, 2, 0);
    add(28, 1, 22, 0, 0.5, 0, lam(0xffffff, tileT));
    for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const z = -20 + i * 5; add(1.3, 11, 1.3, s * 18, 9.5, z, marbleM); if (i < 8) { const ar = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.38, 6, 18, Math.PI), marbleM); ar.position.set(s * 18, 15, z + 2.5); ar.rotation.y = Math.PI / 2; ar.castShadow = true; gP.add(ar); } }
    for (const s of [-1, 1]) add(1.8, 1.0, 44, s * 18, 18.4, 0, marbleM);
    add(10, 1.2, 7, 0, 4.6, -18, lapisM);
    for (let i = 0; i < 3; i++) add(12 - i * 1.5, 0.5, 1.2, 0, 3.75 - i * 0.5 + 0.5, 25.6 + i * 1.2 - 0.6);
  }
  const penT = canvasTex(64, 256, (g, w, h) => { g.fillStyle = "#3f7f86"; g.fillRect(0, 0, w, h); g.fillStyle = "#d9a441"; g.fillRect(0, h * 0.12, w, h * 0.06); g.fillRect(0, h * 0.8, w, h * 0.06); g.fillStyle = "#f4ead8"; g.beginPath(); g.moveTo(0, h); g.lineTo(w / 2, h * 0.9); g.lineTo(w, h); g.fill(); });
  for (const s of [-1, 1]) for (const z of [-12.5, -2.5, 7.5]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 7), lam(0xffffff, penT, { side: THREE.DoubleSide })); p.position.set(s * 18, 11.5, z); p.rotation.y = Math.PI / 2; p.castShadow = true; gP.add(p); }
  const PALMS_P = [palm(gP, -26, 22, 12), palm(gP, 26, 23, 14)];
  const thrMatP = { gold: goldM, red: redM, gem: [0xb3243a, 0x2f8a63, 0x2f4fa3].map((c) => lam(c, null, { emissive: c, emissiveIntensity: 0.25 })) };
  const thrP = makeThrone(thrMatP); thrP.position.set(0, 5.2, -18); gP.add(thrP);
  const thrPMats = [goldM.clone(), redM.clone(), ...thrMatP.gem.map((m) => m.clone())];
  { let k = 0; thrP.traverse((o) => { if (o.isMesh) { const src = o.material; const i = src === goldM ? 0 : src === redM ? 1 : 2 + thrMatP.gem.indexOf(src); o.material = thrPMats[i]; } }); thrPMats.forEach((m) => { m.transparent = true; }); k++; }
  // fish under the floor
  const fishG = merge([[new THREE.SphereGeometry(1, 12, 8), M4(0, 0, 0, 0, 0, 0, 0.32, 0.24, 0.85)], [new THREE.ConeGeometry(0.34, 0.6, 4), M4(0, 0, -1.0, -Math.PI / 2, 0, 0, 0.3, 1, 1)]]);
  const NFI = 11, fish = new THREE.InstancedMesh(fishG, lam(0xffffff), NFI); fish.frustumCulled = false; gP.add(fish);
  const FISH = []; { const q = mulberry(505), fc = [0xe2702e, 0xf2efe6, 0xe9a23b, 0xd2552f, 0xf0c46a]; for (let i = 0; i < NFI; i++) { FISH.push({ a: 5 + q() * 6.5, b: 3.5 + q() * 5, ph: q() * 6.283, w: (q() < 0.5 ? -1 : 1) * (0.25 + q() * 0.3), y: 1.7 + q() * 1.2, s: 0.9 + q() * 0.6, ox: (q() - 0.5) * 4, oz: (q() - 0.5) * 3 }); fish.setColorAt(i, new THREE.Color(fc[i % fc.length])); } }
  const NOISE = `float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+1.7;a*=.5;}return s;}`;
  const WU = { uT: { value: 0 }, uRip: { value: 1 }, uGrid: { value: 0 }, uSweep: { value: -1 } };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), new THREE.ShaderMaterial({
    uniforms: WU, transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uT,uRip;varying vec2 vP;${NOISE}
void main(){vec2 p=vP;float rip=0.;
 for(int k=0;k<3;k++){vec2 c=vec2(float(k)*7.-7.,-6.+float(k)*4.5);float ph=fract(uT*.33+float(k)*.37);float d=length(p-c);float R=ph*9.;rip+=exp(-pow((d-R)*1.6,2.))*(1.-ph);}
 rip*=uRip;float cau=pow(abs(sin(fbm(p*.45+uT*.25)*9.)),6.);
 vec3 col=mix(vec3(.30,.58,.66),vec3(.55,.80,.82),fbm(p*.2+uT*.05));
 col+=vec3(.9,.95,.9)*(cau*.25*uRip+rip*.5);
 gl_FragColor=vec4(col,.42+rip*.25);}`,
  }));
  water.rotation.x = -Math.PI / 2; water.position.y = 3.5; water.renderOrder = 5; gP.add(water);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), new THREE.ShaderMaterial({
    uniforms: WU, transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uGrid,uSweep;varying vec2 vP;
void main(){vec2 g=abs(fract(vP/3.5+.5)-.5);float line=1.-smoothstep(.0,.035,min(g.x,g.y));
 float s=(vP.x/28.+.5)*.55+(vP.y/22.+.5)*.45;float band=exp(-pow((s-uSweep)*9.,2.));
 float a=line*.5*uGrid+band*.6+.04;vec3 col=mix(vec3(.85,.95,1.),vec3(1.),band);
 gl_FragColor=vec4(col,a);}`,
  }));
  glass.rotation.x = -Math.PI / 2; glass.position.y = 4.03; glass.renderOrder = 6; gP.add(glass);
  const queenP = new THREE.Mesh(queenG, plumM); queenP.castShadow = true; queenP.scale.setScalar(1.55); gP.add(queenP);

  // ======================================================================= SKY, SUN, CLOUDS, LIGHT
  const skyTex = canvasTex(256, 1024, (g, w, h) => {
    const q = mulberry(808);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#8fb0c8"); gr.addColorStop(0.42, "#c9d8de"); gr.addColorStop(0.5, "#f3e8d2"); gr.addColorStop(1, "#efe1c4");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = q() * w, y = q() * h * 0.5, rr = 20 + q() * 60; const c = q() < 0.5 ? "255,255,255" : "120,150,180"; const gg = g.createRadialGradient(x, y, 1, x, y, rr); gg.addColorStop(0, `rgba(${c},.18)`); gg.addColorStop(0.8, `rgba(${c},.22)`); gg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  });
  const skyM = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 24), skyM); sky.renderOrder = -1; scene.add(sky);
  const sunTex = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "rgba(255,246,214,1)"); gr.addColorStop(0.28, "rgba(255,226,160,.95)"); gr.addColorStop(0.36, "rgba(250,200,130,.5)"); gr.addColorStop(1, "rgba(250,190,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const sunSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, fog: false, depthWrite: false, transparent: true })); sunSp.scale.setScalar(260); scene.add(sunSp);
  const cloudTex = canvasTex(512, 256, (g, w, h) => {
    const q = mulberry(909); g.clearRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = 90 + q() * 330, y = 90 + q() * 90, rr = 40 + q() * 70; const gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, "rgba(255,252,246,.55)"); gr.addColorStop(0.8, "rgba(240,236,232,.5)"); gr.addColorStop(1, "rgba(200,205,215,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  });
  const CLOUDS = [];
  { const q = mulberry(919); for (let i = 0; i < 9; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.85 })); sp.scale.set(70 + q() * 50, 32 + q() * 20, 1); sp.position.set((q() - 0.5) * 320, 230 + q() * 80, 120 + q() * 260); gA.add(sp); CLOUDS.push(sp); }
    for (let i = 0; i < 10; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, transparent: true, depthWrite: false, opacity: 0.8 })); sp.scale.set(90 + q() * 60, 40 + q() * 24, 1); const side = i % 2 ? 1 : -1; sp.position.set(X0 + side * (230 + q() * 120), 90 + q() * 50, (q() - 0.5) * 600); gM.add(sp); } }
  const hemi = new THREE.HemisphereLight(0xdde6ec, 0xc9a87a, 1.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffecd0, 2.3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; scene.add(sun, sun.target);

  // ---------- veil (watercolor bleed that carries the camera) and blink lids, fixed to the lens
  const VU = { uA: { value: 0 }, uB: { value: 0 } };
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: VU, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uA,uB;varying vec2 vUv;${NOISE}
void main(){vec2 p=vUv;
 float n=fbm(p*vec2(3.,5.3)+3.1)*.7+fbm(p*vec2(11.,19.))*.3;
 float th=1.15-uA*1.55;float a=smoothstep(th-.05,th+.05,n);
 float edge=1.-smoothstep(0.,.08,abs(n-th));
 vec3 wash=mix(vec3(.80,.86,.90),vec3(.95,.86,.72),fbm(p*4.+7.));
 vec3 col=mix(vec3(.97,.93,.86),wash,.55)*(1.-edge*.22*step(.001,uA));
 float d=abs(p.y-.5)-(1.-uB)*.62+.08*pow(abs(p.x-.5)*2.,2.)*(1.-uB)+.02;
 float lid=uB>0.?smoothstep(-.015,.015,d):0.;
 gl_FragColor=vec4(mix(col,vec3(.18,.13,.11),lid),max(a,lid));}`,
  }));
  veil.position.z = -0.3; veil.scale.set(0.15, 0.25, 1); veil.renderOrder = 9999; veil.frustumCulled = false; cam.add(veil);

  // ---------- watercolor post pass (after OutputPass, in display space)
  const wcPass = new ShaderPass(new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1080, 1920) }, uT: { value: 0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uT;varying vec2 vUv;${NOISE}
float L(vec3 c){return dot(c,vec3(.299,.587,.114));}
vec3 T(vec2 u){return texture2D(tDiffuse,u).rgb;}
void main(){
 vec2 px=1./uRes;float boil=floor(uT*6.);
 vec2 wob=(vec2(fbm(vUv*vec2(5.,9.)+boil*.37),fbm(vUv*vec2(5.,9.)+11.3+boil*.21))-.5)*.0055;
 vec2 u=vUv+wob;
 vec3 c=T(u);
 vec3 b=(T(u+vec2(3.,0.)*px)+T(u-vec2(3.,0.)*px)+T(u+vec2(0.,3.)*px)+T(u-vec2(0.,3.)*px))*.25;
 vec3 bw=vec3(0.);for(int i=0;i<8;i++){float a=float(i)*.785;bw+=T(u+vec2(cos(a),sin(a))*px*8.);}bw*=.125;
 c=mix(c,b,.4);
 float pool=clamp((L(bw)-L(c))*1.6,0.,.22);
 c*=1.-pool;
 float g=0.;vec2 o=px*1.4;
 float tl=L(T(vUv+vec2(-o.x,o.y))),tc=L(T(vUv+vec2(0.,o.y))),tr=L(T(vUv+o)),ml=L(T(vUv-vec2(o.x,0.))),mr=L(T(vUv+vec2(o.x,0.))),bl=L(T(vUv-o)),bc=L(T(vUv-vec2(0.,o.y))),br=L(T(vUv+vec2(o.x,-o.y)));
 float gx=tr+2.*mr+br-tl-2.*ml-bl,gy=tl+2.*tc+tr-bl-2.*bc-br;
 float e=length(vec2(gx,gy));
 float pen=smoothstep(.16,.42,e)*(.55+.45*vn(vUv*vec2(700.,260.)+boil*3.1));
 float gran=fbm(vUv*vec2(300.,520.));
 c*=1.-(1.-L(c))*.2*gran;
 float fib=fbm(vUv*vec2(160.,280.))*.55+fbm(vUv*vec2(18.,32.))*.45;
 c=mix(c,vec3(1.),.05);
 c*=.9+.1*fib;
 c=mix(c,vec3(.25,.2,.18),pen*.6);
 gl_FragColor=vec4(c,1.);}`,
  }));
  comp.addPass(wcPass);
  bp.strength = 0.22;

  // ---------- camera tracks
  const trA = track([
    [0, 0.95, 1.22, -1.55, 0, 0.98, 0.15],
    [tB, 1.0, 1.25, -1.75, 0, 1.0, 0.2],
    [tM1 + 0.6, 1.7, 2.3, -4.6, 0, 0.7, 2.2],
    [K.s1e - 1.0, 2.2, 3.4, -8.6, 0, 0.9, 5],
    [K.s2 + 0.5, 1.8, 5.5, -11, 0, 3, 12],
    [K.s2 + 2.5, 0.8, 40, -40, 0, 25, 240],
    [K.s2 + 5.5, 0, 140, -70, 0, 40, 470],
    [K.s2e - 0.3, 0, 150, 90, 0, 30, 480],
    [K.s3 + 0.9, 0, 120, 40, 0, 10, 140],
    [tLemb + 0.2, 0, 32, -14, 0, 2, 8],
    [tKata, -1.3, 2.8, -6.5, 0, 0.8, 0.6],
    [tWahai + 0.5, -0.95, 1.45, -2.2, 0, 0.98, 0.1],
    [tMasuk + 1.6, -2.4, 4.4, -8.8, 0, 0.3, 1.5],
    [tInjak + 0.6, -3.6, 6.5, -12, 0, 1.0, 12],
    [tSadar + 0.2, -1.6, 2.3, -6.2, 0, 0.75, 1.2],
    [tSenyum + 1.2, 1.4, 1.7, -3.8, 0, 0.95, 1.2],
    [tKuasa - 0.4, 1.9, 2.1, -4.6, 0, 1.0, 2.0],
    [tKuasa + 2.6, 4, 14, -26, 0, 3, 12],
    [tPeriksa + 0.3, 2, 6, -18, 0, 8, 10],
    [tHud, 0, 2.4, -7, 0, 40, 22],
    [tHud2 + 0.2, 0, 6, -5, 0, 42, 21],
    [CUT1, -2, 37, 9, -3, 43.7, 19],
  ]);
  const wk = (O, keys, F) => track(keys.map(([t, a, b, c, d, e, f, k]) => { const m = k ?? F; return [t, ...toW(O, d + (a - d) * m, e + (b - e) * m, f + (c - f) * m), ...toW(O, d, e, f)]; }));
  const trS = wk(SABA, [
    [CUT1, 3, 40, -290, 0, 28, -252, 1],
    [CUT1 + 0.9, 3, 32, -170, -2, 18, -110, 1],
    [tSaba + 0.4, 4, 40, -100, 0, 8, 0, 1.15],
    [tRatu, -2, 22, -52, -8, 7, -2],
    [tSing + 0.3, -10, 15, -34, -12, 7, -2],
    [tSembah - 0.3, 4, 16, -36, 10, 6, 4],
    [tMata + 0.5, 12, 14, -32, 8, 9, 10],
    [K.s6, 4, 22, -44, -6, 6, -12],
    [tSurat + 0.4, -4, 18, -48, -12, 6, -22],
    [tBuka + 0.4, -9, 11, -34, -12, 2, -22],
    [tBism + 0.2, -11, 8.5, -29.5, -12, 2, -22.5],
    [tSang + 0.3, -20, 9, -32, -12, 2.5, -22],
    [tMusy + 1.2, -25, 10, -15, -12, 2.5, -22],
    [tHad - 0.2, -24, 16, -4, -10, 3, -26],
    [tHad + 0.9, 30, 44, 6, -4, 3, -50, 1],
    [tTolak + 0.4, 24, 82, 8, 0, 3, -108, 1],
    [tAllah6 + 0.4, 26, 76, 22, 0, 3, -80, 1],
    [K.s7, 28, 70, 34, -2, 3, -60, 1],
    [tSeb + 1.3, 26, 58, 28, -3, 3, -50, 1],
    [tPindah - 0.6, -2, 13, -20, -14, 6, -2],
    [tPindah + 0.9, -4, 12, -23, -14, 6, -2],
    [BLINK - 0.9, 8, 34, -10, -18, 20, -60, 1],
    [BLINK, 4, 40, -30, -22, 24, -130, 1],
  ], 2.1);
  const trP = wk(PAL, [
    [BLINK, 9, 10, -4, 0, 7, -16],
    [BLINK + 0.8, 12, 9, 4, 0, 5, -12],
    [tMasukI + 0.3, 6, 8, 28, 0, 4.5, 10],
    [tKolam - 0.3, 6, 6.6, 21, 0, 3.4, 3],
    [tTern, 3, 5.8, 17, 0, 3.2, -1],
    [tKaca + 0.2, -4, 6.4, 18, 0, 3.6, 0],
    [tSerah, -8, 7.2, 23, 0, 5.8, 12],
    [CUT2 - 0.6, -5, 10, 29, 0, 6, 10],
    [CUT2, -3, 22, 35, 0, 8, 8],
  ], 1.6);
  const trB = track([
    [CUT2, 0.5, 9, -15, 0, 1.5, 1],
    [CUT2 + 1.6, -1.2, 2.4, -5.8, 0, 0.8, 0.6],
    [tKalau, -2.5, 5.2, -9, 0, 0.7, 2],
    [K.end + 0.5, -3, 7.5, -12, 0, 0.9, 2.5],
    [K.dur, -3.4, 8.5, -13, 0, 1, 2.8],
  ]);

  // ---------- story functions
  const shadowFront = (t) => (t < K.s2 ? 60 - 38 * eout(t / K.s1e) : t < K.s3 ? 22 : t < CUT2 ? 22 - 13 * ramp(t, tLemb - 0.5, tSadar + 0.3) + 3.5 * ramp(t, tSenyum, tSenyum + 2.2) : 1e4);
  const zArmy = (t) => (t < K.s2 ? 520 : t < K.s3 ? lerp(520, 420, (t - K.s2) / (K.s3 - K.s2)) : lerp(420, 210, ramp(t, K.s3, tSadar)) + 20 * ramp(t, tSenyum, tSenyum + 2.5));
  const antProg = (a, t) => {
    if (t < K.s2) return ramp(t, 1.3 + a.d * 1.3, 1.3 + a.d * 1.3 + a.tr);
    if (t < K.s3) return 0;
    if (t < CUT2) return ramp(t, tMasuk + a.d * 1.5, tMasuk + a.d * 1.5 + a.tr);
    return 1 - ramp(t, CUT2 + 0.9 + a.d * 2.2, CUT2 + 0.9 + a.d * 2.2 + a.tr * 1.4);
  };
  const antPos = (a, t, out) => {
    const g = antProg(a, t), e = g * g * (3 - 2 * g);
    const wx = a.x + Math.sin(t * a.f1 + a.p1) * 0.35 * (1 - g), wz = a.z + Math.cos(t * a.f2 + a.p2) * 0.35 * (1 - g);
    const [hx, hz] = HOLES[a.h];
    const dx = hx - wx, dz = hz - wz, L = Math.hypot(dx, dz) || 1;
    const bend = Math.sin(Math.PI * e) * a.curv;
    out.set(wx + dx * e - dz / L * bend, 0, wz + dz * e + dx / L * bend);
    return g;
  };
  const flockL = (t) => [0, 44, 18 + 1.0 * (t - tPeriksa)];
  const tArr = CUT1 + 1.7, tLeave = K.s6 - 1.1;
  const P0 = [0, 30, -262], P1 = [-4, 15, -24];
  const circ = (t) => { const ph = -0.15 + 0.42 * (t - tArr); return [26 * Math.sin(ph), 20, -26 * Math.cos(ph) + 2]; };
  // returns [zone, x,y,z (world), yaw, flap, crest, scale, carry]
  const hud = (t) => {
    if (t < tTak - 0.2 || (t >= CUT2)) return null;
    if (t < CUT1) {
      const L = flockL(t), sl = [L[0] - 3.0, L[1] - 0.3, L[2] - 3.8];
      const u = eout((t - (tTak - 0.2)) / (tHud2 + 0.3 - tTak + 0.2));
      const st = [26, 49, L[2] - 8];
      const p = [lerp(st[0], sl[0], u), lerp(st[1], sl[1], u), lerp(st[2], sl[2], u)];
      const yaw = u < 0.98 ? Math.atan2(sl[0] - st[0], sl[2] - st[2]) * (1 - u) : 0;
      return ["A", ...p, yaw, 1, 0.2, 1.0, false];
    }
    let p, yaw, flap = 1, crest = 0.1, carry = false;
    if (t < tArr) { const u = eout((t - CUT1) / (tArr - CUT1)); p = [lerp(P0[0], P1[0], u), lerp(P0[1], P1[1], u), lerp(P0[2], P1[2], u)]; yaw = 0; }
    else if (t < tLeave) { const c = circ(t), b = ramp(t, tArr, tArr + 0.9); p = [lerp(P1[0], c[0], b), lerp(P1[1], c[1], b), lerp(P1[2], c[2], b)]; const ph = -0.15 + 0.42 * (t - tArr); yaw = Math.atan2(Math.cos(ph), Math.sin(ph)); crest = 0.5; }
    else if (t < K.s6 + 0.5) { const c = circ(tLeave), u = ramp(t, tLeave, K.s6 + 0.5); p = [lerp(c[0], 0, u), lerp(c[1], 34, u), lerp(c[2], -130, u)]; yaw = Math.PI; }
    else if (t < tBuka + 0.35) { const u = eout((t - K.s6 - 0.5) / (tBuka - K.s6 - 0.2)); p = [lerp(0, -12, u), lerp(34, 8.5, u), lerp(-130, -23.5, u)]; yaw = Math.atan2(-12, 106.5) * (1 - u * 0.6); carry = true; crest = 0.2 + 0.8 * u; }
    else if (t < tSang + 0.6) { const u = ramp(t, tBuka + 0.35, tSang + 0.6); p = [lerp(-12, -60, u), lerp(8.5, 44, u), lerp(-23.5, 34, u)]; yaw = Math.atan2(-48, 57.5); crest = 1 - u; }
    else return null;
    return ["M", ...toW(SABA, p[0], p[1], p[2]), yaw + TH, flap, crest, 2.2, carry];
  };

  // per-zone light and sky moods
  const C = (h) => new THREE.Color(h);
  const MOOD = {
    morn: { sun: C(0xffecd0), si: 2.3, sky: C(0xdde6ec), gnd: C(0xc9a87a), hi: 1.6, tint: C(0xffffff), fog: C(0xf2e6cf) },
    gold: { sun: C(0xffbf72), si: 2.6, sky: C(0xf3dcb4), gnd: C(0xc89a62), hi: 1.5, tint: C(0xffe2b8), fog: C(0xf3d9ae) },
    day: { sun: C(0xfff1dc), si: 2.2, sky: C(0xdbe6ee), gnd: C(0xcfb284), hi: 1.65, tint: C(0xffffff), fog: C(0xefe4cc) },
    warm: { sun: C(0xffc88e), si: 2.3, sky: C(0xf0dcc0), gnd: C(0xc8a070), hi: 1.6, tint: C(0xffe6c6), fog: C(0xf1dcbc) },
    dusk: { sun: C(0xff9c6c), si: 2.1, sky: C(0xe9c6bb), gnd: C(0xb88a6a), hi: 1.5, tint: C(0xffc6a8), fog: C(0xf0cdb0) },
  };
  const mix2 = (a, b, u) => { const o = {}; for (const k in a) o[k] = typeof a[k] === "number" ? lerp(a[k], b[k], u) : a[k].clone().lerp(b[k], u); return o; };
  const mood = (t) => {
    if (t < CUT1) { const m = mix2(MOOD.morn, MOOD.gold, ramp(t, tSenyum - 0.3, tSenyum + 1.5)); return mix2(m, MOOD.day, ramp(t, tPeriksa - 0.5, tPeriksa + 1.5)); }
    if (t < CUT2) { let m = mix2(MOOD.day, MOOD.warm, ramp(t, tSembah - 0.5, tMata + 0.5) * (1 - ramp(t, K.s6 - 0.5, K.s6 + 1))); return mix2(m, MOOD.warm, ramp(t, K.s8 - 1, tSerah + 1)); }
    return MOOD.dusk;
  };
  const sunDir = new THREE.Vector3();
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), ap = new THREE.Vector3(), ap2 = new THREE.Vector3();
  const qBird = (t, i) => {        // the army's flock (s2) and the valley V (s5)
    if (i < 33) {
      const vv = Math.floor(i / 11), j = i % 11, arm = j === 0 ? 0 : j <= 5 ? 1 : -1, jj = j === 0 ? 0 : ((j - 1) % 5) + 1;
      const za = zArmy(t);
      return [(vv - 1) * 70 + arm * jj * 9, 175 + vv * 18 - jj * 1.5, za - 30 + vv * 40 + jj * 10, Math.PI, 7];
    }
    const j = i - 33, L = flockL(t);
    if (j === 0) return [L[0], L[1], L[2], 0, 1.3];
    const k = j <= 5 ? j : j - 4, side = j <= 5 ? 1 : -1;      // right arm skips position 2: the empty place
    const kk = side < 0 && k >= 2 ? k + 1 : k;
    const n = side > 0 ? k : kk;
    return [L[0] + side * 1.5 * n, L[1] - 0.15 * n, L[2] - 1.9 * n, 0, 1.3];
  };

  return (t) => {
    const zM = t >= CUT1 && t < CUT2;
    gA.visible = !zM; gM.visible = zM;
    wcPass.uniforms.uT.value = t;
    WU.uT.value = t;

    // camera
    let v;
    if (t < CUT1) v = trA(t);
    else if (t < BLINK) {
      v = trS(t);
      const hw = ramp(t, tPindah + 0.3, tPindah + 1.2);
      if (hw > 0) {
        const hd = streakCurve.getPoint(ramp(t, tPindah + 0.5, BLINK - 0.05)), w = toW(SABA, hd.x, hd.y, hd.z);
        const cp = toW(SABA, hd.x + 34, hd.y + 70, hd.z + 60);
        v = [lerp(v[0], cp[0], hw), lerp(v[1], cp[1], hw), lerp(v[2], cp[2], hw), lerp(v[3], w[0], hw), lerp(v[4], w[1], hw), lerp(v[5], w[2], hw)];
      }
    } else if (t < CUT2) v = trP(t);
    else v = trB(t);
    if (!zM) v[1] = Math.max(v[1], 0.35);
    cam.position.set(v[0], v[1], v[2]);
    cam.lookAt(v[3], v[4], v[5]);
    const camD = Math.hypot(v[0] - v[3], v[1] - v[4], v[2] - v[5]);

    // veil + blink
    VU.uA.value = Math.max(ramp(t, CUT1 - 0.55, CUT1) * (1 - ramp(t, CUT1, CUT1 + 0.65)), ramp(t, CUT2 - 0.55, CUT2) * (1 - ramp(t, CUT2, CUT2 + 0.65)));
    VU.uB.value = ramp(t, BLINK - 0.13, BLINK) * (1 - ramp(t, BLINK, BLINK + 0.2));
    veil.visible = VU.uA.value > 0.001 || VU.uB.value > 0.001;

    // light & atmosphere
    const md = mood(t);
    hemi.color.copy(md.sky); hemi.groundColor.copy(md.gnd); hemi.intensity = md.hi;
    sun.color.copy(md.sun); sun.intensity = md.si;
    skyM.color.copy(md.tint);
    scene.background.copy(md.fog); scene.fog.color.copy(md.fog);
    let fd;
    if (zM) fd = 0.0015;
    else if (t < CUT1) fd = t < K.s2 + 0.3 ? 0.009 : t < K.s3 ? lerp(0.009, 0.0005, ramp(t, K.s2 + 0.3, K.s2 + 3)) : lerp(0.0005, 0.0042, ramp(t, K.s3 + 0.5, tLemb + 1));
    else fd = 0.008;
    scene.fog.density = fd;
    sky.position.copy(cam.position);
    if (zM) sunDir.set(-0.45, 0.72, -0.52).normalize(); else if (t < CUT1) sunDir.set(-0.62, 0.55, 0.56).normalize(); else sunDir.set(-0.55, 0.32, 0.77).normalize();
    if (!zM && t < CUT1) sunDir.y = lerp(0.55, 0.3, ramp(t, tSenyum - 0.3, tSenyum + 1.5) * (1 - ramp(t, tPeriksa - 0.5, tPeriksa + 1.5)));
    sunDir.normalize();
    const half = Math.min(420, Math.max(7, camD * 0.85));
    sun.target.position.set(v[3], 0, v[5]);
    sun.position.copy(sun.target.position).addScaledVector(sunDir, half + 140);
    const sc = sun.shadow.camera; sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 1; sc.far = half * 2 + 300; sc.updateProjectionMatrix();
    sun.shadow.normalBias = 0.02 * half / 10;
    sunSp.position.copy(cam.position).addScaledVector(sunDir.clone().setY(sunDir.y * 0.35).normalize(), 1300);
    sunSp.material.opacity = zM ? 0.75 : 1;

    // ===== ant valley
    if (!zM) {
      // grass sway
      for (let i = 0; i < NG; i++) { const b = GR[i]; tmpM.compose(tmpP.set(b.x, 0, b.z), tmpQ.setFromEuler(tmpE.set(b.lean + Math.sin(t * 1.3 + b.ph) * 0.06, b.yaw, Math.sin(t * 0.9 + b.ph * 1.7) * 0.05, "YXZ")), tmpS.set(b.h * 0.9, b.h, b.h)); grass.setMatrixAt(i, tmpM); }
      grass.instanceMatrix.needsUpdate = true;
      // ants
      for (let i = 0; i < NA; i++) {
        const a = ANT[i];
        const g = antPos(a, t, ap); antPos(a, t + 0.06, ap2);
        let dx = ap2.x - ap.x, dz = ap2.z - ap.z;
        if (Math.hypot(dx, dz) < 1e-5) { dx = Math.cos(t * a.f1 + a.p1) * a.f1; dz = -Math.sin(t * a.f2 + a.p2) * a.f2; }
        const yaw = Math.atan2(dx, dz);
        let s = a.sc, y = 0;
        if (g > 0.9) { const k = (g - 0.9) / 0.1; s *= 1 - 0.8 * k; y = -0.25 * k; }
        if (g >= 0.999 || (t > CUT1 && t < CUT2)) s = 0.0001;
        tmpM.compose(tmpP.set(ap.x, y + Math.abs(Math.sin(t * 22 + a.p1)) * 0.012, ap.z), tmpQ.setFromAxisAngle(UP, yaw), tmpS.setScalar(s));
        ants.setMatrixAt(i, tmpM);
      }
      ants.instanceMatrix.needsUpdate = true;
      // the caller
      const call1 = ramp(t, tB - 0.2, tB + 0.3) * (1 - ramp(t, K.s1e - 0.4, K.s1e + 0.4));
      const call3 = ramp(t, tKata - 0.3, tKata + 0.2) * (1 - ramp(t, tSadar, tSadar + 0.8));
      const calling = Math.max(call1, call3);
      const turn = ramp(t, tSenyum - 0.4, tSenyum + 0.8) * (t < CUT2 ? 1 : 0);
      lead.rotation.set(0, lerp(Math.PI * 0.92, 0.25, turn) + (t >= CUT2 ? -0.5 : 0), 0);
      leadBody.rotation.set(-(0.42 * calling + 0.12 * turn) + Math.sin(t * 9) * 0.05 * calling, 0, 0);
      antn.forEach((pv, k) => { pv.rotation.set(-0.5 * calling + Math.sin(t * 7 + k * 1.7) * (0.25 + 0.35 * calling), 0, (k ? 1 : -1) * Math.sin(t * 5 + k) * 0.25); });
      RINGS.forEach((m, k) => {
        let a = 0, s = 0.1;
        for (const [t0, t1] of [[tB, K.s1e], [tKata, tSadar + 0.2]]) { if (t > t0 && t < t1) { const ph = ((t - t0) / 0.9 + k * 0.25) % 1; a = (1 - ph) * 0.55 * ramp(t, t0, t0 + 0.2) * (1 - ramp(t, t1 - 0.4, t1)); s = 0.15 + ph * 1.5; } }
        m.material.opacity = a; m.scale.setScalar(s);
        m.position.set(0, ANT_Y + 0.25, 0); m.lookAt(cam.position);
      });
      // the army's shadow, hoofprints, dust
      const zf = shadowFront(t);
      shadow.position.set(0, 0.03, zf + 120); shadow.visible = zf < 500;
      for (const h of HOOF) { const show = t < CUT2 ? ramp(zf + 26, h.z + 6, h.z - 1) : 1; h.m.material.opacity = 0.85 * show; }
      const dAmt = t < CUT2 ? 1 - 0.75 * ramp(t, tSenyum, tSenyum + 3) : 0;
      for (let i = 0; i < 320; i++) {
        const s = dseed[i];
        const life = (t * (0.08 + s[3] * 0.08) + s[0]) % 1;
        dust.pos[i * 3] = (s[1] - 0.5) * 120 + Math.sin(t * 0.3 + s[2] * 9) * 2;
        dust.pos[i * 3 + 1] = (0.3 + life * (4 + s[2] * 14)) * dAmt - (dAmt < 0.02 ? 300 : 0);
        dust.pos[i * 3 + 2] = zf + 24 + s[2] * 60 - life * 8;
      }
      dust.commit();
      // the army on the road
      const za = zArmy(t), high = t > K.s2 - 0.2 && t < tLemb + 0.5 ? 1 : 0, armyOn = t < CUT2;
      for (let i = 0; i < NF; i++) {
        const f = FIG[i];
        const step = Math.abs(Math.sin(t * 3.2 + f.r * 0.0)) * 1.6;
        tmpM.compose(tmpP.set(f.x, step, za + 40 + f.r * 26 + f.dz), tmpQ.setFromAxisAngle(UP, Math.PI), tmpS.setScalar(high && armyOn ? 12 : 0.0001));
        figs.setMatrixAt(i, tmpM);
      }
      figs.instanceMatrix.needsUpdate = true;
      for (let k = 0; k < NBAN; k++) {
        const b = BAN[k], z = za + 30 + b.r * 26, s = armyOn ? 1 : 0.0001;
        tmpM.compose(tmpP.set(b.x, 0, z), tmpQ.identity(), tmpS.set(s, 58 * s, s)); poles.setMatrixAt(k, tmpM);
        tmpM.compose(tmpP.set(b.x, 49, z), tmpQ.setFromAxisAngle(UP, Math.PI / 2 + Math.sin(t * 1.4 + b.ph) * 0.25), tmpS.set(16 * s, 10 * s, s)); flags.setMatrixAt(k, tmpM);
      }
      poles.instanceMatrix.needsUpdate = flags.instanceMatrix.needsUpdate = true;
      const sl = flockL(t);
      slot.position.set(sl[0] - 3.0, sl[1] - 0.3, sl[2] - 3.8); slot.lookAt(cam.position);
      slot.material.opacity = ramp(t, tPeriksa + 0.6, tHud) * (1 - ramp(t, tHud2 - 0.2, tHud2 + 0.3)) * (0.65 + 0.35 * Math.sin(t * 6));
      slot.visible = t > tPeriksa && t < CUT1;
    }
    // birds (shared)
    for (let i = 0; i < NBI; i++) {
      const bq = qBird(t, i);
      const on = !zM && ((i < 33 && t > K.s2 && t < tLemb + 1) || (i >= 33 && t > tPeriksa - 0.5 && t < CUT1));
      const flap = Math.sin(t * (i < 33 ? 6 : 9) + i * 1.3) * 0.55 + 0.1;
      setBird(i, bq[0], bq[1] + Math.sin(t * 1.5 + i) * 0.3, bq[2], bq[3], 0, flap, on ? bq[4] : 0.0001);
    }
    bBody.instanceMatrix.needsUpdate = bWL.instanceMatrix.needsUpdate = bWR.instanceMatrix.needsUpdate = true;

    // the hoopoe
    const h = hud(t);
    hoopoe.visible = !!h && (h[0] === "M") === zM;
    if (hoopoe.visible) {
      hoopoe.position.set(h[1], h[2], h[3]);
      hoopoe.rotation.set(0.08, h[4], 0, "YXZ");
      hoopoe.scale.setScalar(h[7]);
      const fl = Math.sin(t * 15) * 0.95;
      hWings[0].rotation.z = fl; hWings[1].rotation.z = fl;
      crest.forEach((pv, i) => { pv.rotation.x = lerp(-1.45, lerp(-1.25, 0.6, i / 7), h[6]); });
    }

    // ===== map zone
    if (zM) {
      const P = (p) => p;
      void P;
      // Saba pop-up
      const pS = back((t - tSaba + 0.25) / 0.6, 1.2);
      slabS.scale.set(Math.max(0.001, lerp(0.2, 1, Math.min(1, pS))), 1, Math.max(0.001, lerp(0.2, 1, Math.min(1, pS))));
      const setPop = (o, t0, d = 0.6) => { const [rx, s] = pop(back((t - t0) / d, 1.4)); o.rotation.x = rx; o.scale.setScalar(s); };
      setPop(temple, tSaba - 0.05, 0.7);
      PALMS_S.forEach((p, i) => setPop(p, tSaba + 0.15 + i * 0.08));
      WORS.forEach((w) => { setPop(w.h, tSaba + 0.3 + w.k * 0.02, 0.5); w.m.rotation.x = 0.85 * ramp(t, tSembah + w.k * 0.03, tSembah + 0.6 + w.k * 0.03); });
      setPop(council, tSaba + 0.35);
      // throne: pops big at "singgasana", dissolves at "memindahkan"
      const pT = back((t - tSing + 0.1) / 0.7, 1.9);
      throneS.rotation.x = -(Math.PI / 2) * (1 - Math.min(1, pT));
      throneS.scale.setScalar(Math.max(0.0001, Math.min(1, pT * 3)) * (1 + 0.12 * ramp(t, tSing, tSing + 0.6)));
      const vanish = ramp(t, tPindah + 0.15, tPindah + 1.0);
      thrSMats.forEach((m) => { m.opacity = 1 - vanish; });
      thrS.visible = vanish < 0.999;
      thrS.scale.set(1 + 0.08 * Math.sin(vanish * 20) * vanish, 1 + 0.1 * vanish, 1 + 0.08 * Math.sin(vanish * 20) * vanish);
      sunM.emissive.setRGB(0.5, 0.33, 0.08).multiplyScalar(ramp(t, tSembah - 0.2, tMata + 0.3) * (1 - 0.6 * ramp(t, K.s6, K.s6 + 1.5)));
      sunDisk.rotation.z = t * 0.15;
      // queen: by the throne, then at the council, then leading the journey north
      let qp;
      if (t < K.s6) qp = [-7.2, 1, -6.5, 0];
      else if (t < K.s7 - 0.5) qp = [-12, 1, -16.6, Math.PI];
      else { const u = ramp(t, tSeb - 0.4, BLINK + 2); qp = [lerp(-4, 0, u), u > 0.08 ? 0.05 : 1, lerp(-30, -110, u), Math.PI]; }
      queenS.position.set(qp[0], qp[1], qp[2]); queenS.rotation.y = qp[3];
      queenS.scale.setScalar(Math.max(0.0001, Math.min(1, back((t - tRatu + 0.1) / 0.5, 1.5))) * 1.45);
      PROC.forEach((m, i) => {
        const u = ramp(t, tSeb - 0.1 + i * 0.12, BLINK + 2.5);
        const on = t > K.s7 - 0.3;
        m.position.set((i % 3 - 1) * 1.6, u > 0.06 ? 0.05 : 1, lerp(-26 + Math.floor(i / 3) * 2.4, -100, u));
        m.position.y += Math.abs(Math.sin(t * 6 + i)) * 0.15;
        m.rotation.y = Math.PI; m.scale.setScalar(on ? 1.1 : 0.0001);
      });
      // scroll
      const hh = hud(t);
      let sp;
      if (t < tBuka + 0.35) {
        if (hh && hh[8]) { const u = eout((t - K.s6 - 0.5) / (tBuka - K.s6 - 0.2)); sp = [lerp(0, -12, u), lerp(34, 8.5, u) - 1.6, lerp(-130, -23.5, u) + 0.6]; } else sp = null;
      } else { const u = ramp(t, tBuka + 0.35, tBuka + 0.8); sp = [-12 + 0.4 * u, lerp(6.9, 2.55, u * u), lerp(-22.9, -23.6, u)]; }
      const unroll = ramp(t, tBism - 0.3, tBism + 0.45), on6 = t > K.s6 + 0.4 && t < K.s7 + 1;
      scroll.visible = !!sp && on6;
      if (sp) { scroll.position.set(sp[0], sp[1], sp[2] + unroll * 3.2); scroll.rotation.set(0, 0, (1 - ramp(t, tBuka + 0.35, tBuka + 0.8)) * 0.4); }
      waxSeal.position.set(0, 0.36, 0); waxSeal.rotation.set(0, 0, 0);
      sheet.visible = on6 && unroll > 0.01;
      sheet.scale.set(1, Math.max(0.001, unroll * 3.2), 1);
      sheet.position.set(-11.6, 2.24, -23.6 + unroll * 1.6);
      // gifts: out along the road, stopped by the royal seal, carried back
      CHESTS.forEach((c, i) => {
        const go = ramp(t, tHad - 0.15 + i * 0.15, tTolak - 0.1 + i * 0.05), ret = ramp(t, tTolak + 0.35 + i * 0.08, tAllah6 + 1.1 + i * 0.1);
        const u = go * (1 - 0.88 * ret);
        const bump = Math.exp(-Math.pow((t - tTolak - 0.1) * 5, 2)) * 1.5;
        const z = lerp(-28.5, -124, u) + bump, x = lerp(-15 + 3 * i, (i - 1) * 3.4, Math.min(1, u * 4));
        const y = z > -31 ? 1 : 0.05;
        c.position.set(x, y + Math.abs(Math.sin(t * 7 + i)) * 0.25 * (go > 0 && go < 1 || (ret > 0 && ret < 1) ? 1 : 0), z);
        c.rotation.y = Math.PI * ramp(t, tTolak + 0.05, tTolak + 0.5);
        c.scale.setScalar(t > tHad - 0.6 && t < K.s7 + 2 ? lerp(1.4, 2.2, Math.min(1, u * 2)) : 0.0001);
      });
      const st = ramp(t, tTolak - 0.3, tTolak), stOn = t > tTolak - 0.35 && t < tSeb + 3;
      sealStamp.position.set(0, lerp(60, 0.7, st * st) + 0.4 * Math.exp(-Math.pow((t - tTolak - 0.15) * 6, 2)), -142);
      sealStamp.scale.setScalar(stOn ? 1 - 0.4 * ramp(t, tSeb + 1.5, tSeb + 3) : 0.0001);
      const sh = t - tTolak;
      shock.visible = sh > 0 && sh < 1.2; shock.position.set(0, 0.3, -142); shock.scale.setScalar(9 + sh * 30); shock.material.opacity = 0.7 * (1 - sh / 1.2);
      // streak of light from Saba toward Syam, then the blink
      const head = ramp(t, tPindah + 0.5, BLINK - 0.05);
      const segs = 160 * 6 * 6;
      streak.visible = head > 0 && head < 1 && t < BLINK;
      const a0 = Math.max(0, head - 0.3), i0 = Math.floor(a0 * 160) * 36, i1 = Math.floor(head * 160) * 36;
      streak.geometry.setDrawRange(i0, Math.max(0, i1 - i0)); void segs;
      // palace
      const thrIn = ramp(t, BLINK + 0.05, BLINK + 0.9);
      thrPMats.forEach((m) => { m.opacity = t < BLINK ? 0 : thrIn; });
      thrP.visible = t >= BLINK;
      thrP.scale.set(1 + 0.06 * (1 - thrIn), 1 + 0.06 * (1 - thrIn), 1);
      for (let i = 0; i < NFI; i++) {
        const f = FISH[i], ph = f.ph + t * f.w;
        const x = f.ox + Math.cos(ph) * f.a, z = f.oz + Math.sin(ph) * f.b;
        const yaw = Math.atan2(-Math.sin(ph) * f.a * f.w, Math.cos(ph) * f.b * f.w);
        tmpM.compose(tmpP.set(x, f.y + Math.sin(t * 1.3 + i) * 0.15, z), tmpQ.setFromEuler(tmpE.set(0, yaw, Math.sin(t * 8 + i) * 0.1, "YXZ")), tmpS.setScalar(f.s));
        fish.setMatrixAt(i, tmpM);
      }
      fish.instanceMatrix.needsUpdate = true;
      WU.uRip.value = 1 - 0.85 * ramp(t, tKaca - 0.3, tKaca + 0.6);
      WU.uGrid.value = ramp(t, tTern, tKaca + 0.4);
      WU.uSweep.value = lerp(-0.4, 1.4, ramp(t, tKaca - 0.5, tKaca + 0.8));
      const qu = ramp(t, tMasukI - 0.6, tKolam - 0.2), recoil = ramp(t, tKolam - 0.2, tKolam + 0.5) * (1 - ramp(t, tKaca, tKaca + 1));
      queenP.position.set(0, 4 + Math.abs(Math.sin(t * 5)) * 0.1 * (qu > 0 && qu < 1 ? 1 : 0), lerp(25, 12.9, qu) + 0.5 * recoil);
      queenP.rotation.set(0.1 * ramp(t, tSerah, tSerah + 1.2), Math.PI, 0);
      queenP.visible = t > BLINK + 0.3;
      // sparkles: rise off the empty throne at Saba, gather on the throne in the palace
      const pv = ramp(t, tPindah + 0.1, tPindah + 1.6), pa = ramp(t, BLINK, BLINK + 1.2);
      for (let i = 0; i < 420; i++) {
        const s = kseed[i];
        let w = null;
        if (pv > 0 && pv < 1) { const lx = -14 + (s[0] - 0.5) * 6, ly = 1.5 + s[1] * 12 + pv * (6 + s[2] * 10), lz = -2 + (s[2] - 0.5) * 5 - pv * s[3] * 8; w = toW(SABA, lx + Math.sin(t * 3 + i) * 0.3 * pv, ly, lz); }
        else if (pa > 0 && pa < 1) { const k = 1 - eout(pa); const lx = (s[0] - 0.5) * 5 + Math.cos(s[3] * 6.28) * 9 * k, ly = 6 + s[1] * 10 + 6 * k * s[2], lz = -18 + (s[2] - 0.5) * 4 + Math.sin(s[3] * 6.28) * 9 * k; w = toW(PAL, lx, ly, lz); }
        if (w) { spark.pos[i * 3] = w[0]; spark.pos[i * 3 + 1] = w[1]; spark.pos[i * 3 + 2] = w[2]; } else { spark.pos[i * 3 + 1] = -500; }
      }
      spark.m.opacity = 0.95 * (pv > 0 && pv < 1 ? 1 - pv * 0.7 : pa > 0 && pa < 1 ? 1 - pa * 0.6 : 0);
      spark.commit();
      // palace palms sway a little
      PALMS_P.forEach((p, i) => { p.rotation.z = Math.sin(t * 0.8 + i) * 0.02; });
    } else {
      spark.pos.fill(-500, 0); spark.commit();
    }

    comp.render();
  };
}
