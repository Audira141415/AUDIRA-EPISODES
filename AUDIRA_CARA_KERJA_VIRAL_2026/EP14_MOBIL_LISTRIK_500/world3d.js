// EP14 FIVE HUNDRED. PRECISION look: a generic graphite hypercar (no brand marks) shot like premium product CGI on a closed desert highway.
// One connected world: the car stays at the origin and the road moves past it (distance d(t) is integrated, so frames stay pure).
// s3-s6 freeze the run into a studio inspection: airflow + drag arrow, exploded body with four wheel motors, 1,200 V battery bus, tyre section.
// 1 unit = 1 m. Car faces +x.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, back } from "./lib3d.js";

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const W = 1080, H = 1920;
const L = 4.9, WB = 1.48, WR = 0.35, TW = 0.325, TZ = 0.84;
const lerp = THREE.MathUtils.lerp;

// piecewise-linear keyframe helper
function pl(u, xs, ys) {
  if (u <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (u <= xs[i]) { const k = (u - xs[i - 1]) / (xs[i] - xs[i - 1]); const s = k * k * (3 - 2 * k); return ys[i - 1] + (ys[i] - ys[i - 1]) * s; }
  return ys[ys.length - 1];
}
const sp = (c, n) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.08;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 6000);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    detik: A_("s1:detik", 1.6), mencapai: A_("s2:mencapai", s.s2 + 4), abu: A_("s2:Abu", s.s2 + 9), inilah: A_("s2:Inilah", s.s2 + 12),
    musuh: A_("s3:Musuh", s.s3), hambatan: A_("s3:hambatan", s.s3 + 2.5), dua: A_("s3:Dua", s.s3 + 6), delapan: A_("s3:delapan", s.s3 + 8),
    empat: A_("s4:empat", s.s4 + 1), roda: A_("s4:roda", s.s4 + 2.5), total: A_("s4:total", s.s4 + 7), tiap: A_("s4:Tiap", s.s4 + 12), berputar: A_("s4:berputar", s.s4 + 12.5),
    volt: A_("s5:volt", s.s5 + 1.5), tegangan: A_("s5:tegangan", s.s5 + 4), panas: A_("s5:Panas", s.s5 + 6), dingin: A_("s5:dingin", s.s5 + 9),
    tapi: A_("s6:Tapi", s.s6), karet: A_("s6:Karet", s.s6 + 2.5), sentri: A_("s6:sentrifugal", s.s6 + 4), selebar: A_("s6:selebar", s.s6 + 9),
    baterai: A_("s7:Baterainya", s.s7), penuh: A_("s7:penuh", s.s7 + 3), lintasan: A_("s7:Lintasan", s.s7 + 5.5), kurang: A_("s7:kurang", s.s7 + 8),
    udara: A_("s8:udara", s.s8 + 3), listrik: A_("s8:listrik", s.s8 + 4), karet8: A_("s8:karet", s.s8 + 5),
  };

  const S = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  S.environmentIntensity = 0.5;
  S.environmentRotation.set(0, 0.8, 0);
  S.add(new THREE.AmbientLight(0xffffff, 0.12));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 30 });
  S.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xcfe0ff, 1.4); rim.position.set(-5, 3, -4); S.add(rim);
  const sunW = new THREE.DirectionalLight(0xffe2bf, 1.1); sunW.position.set(-2, 5, 8); S.add(sunW);

  // ---------- backdrop: gradient sky dome (studio warm sand, horizon line) ----------
  const skyTex = canvasTex(8, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#9fb3c4"); g.addColorStop(0.36, "#d9dfe2"); g.addColorStop(0.49, "#f2e3cc"); g.addColorStop(0.53, "#dcc09c"); g.addColorStop(1, "#b89a76");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const skyM = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, toneMapped: false, depthWrite: false, fog: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), skyM); S.add(sky);
  S.fog = new THREE.Fog(0xe9dcc6, 120, 1400);

  // sand ground with fine ripples, moved by texture offset
  const sandTex = canvasTex(512, 512, (c, w) => {
    c.fillStyle = "#d4b994"; c.fillRect(0, 0, w, w);
    const R = mulberry(31);
    for (let i = 0; i < 9000; i++) { c.fillStyle = R() > 0.5 ? "rgba(120,90,60,.09)" : "rgba(255,240,215,.12)"; c.fillRect(R() * w, R() * w, 1 + R() * 3, 1 + R() * 2); }
    c.strokeStyle = "rgba(140,105,70,.16)"; c.lineWidth = 2;
    for (let y = 0; y < w; y += 22) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + 5 * Math.sin(x * 0.05 + y)); c.stroke(); }
  }, [140, 140]);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(2800, 2800), new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.95 }));
  sand.rotation.x = -Math.PI / 2; sand.position.y = -0.02; sand.receiveShadow = true; S.add(sand);
  // asphalt road with lane dashes (tile = 24 m along x)
  const roadTex = canvasTex(1024, 512, (c, w, h) => {
    c.fillStyle = "#3a3b3d"; c.fillRect(0, 0, w, h);
    const R = mulberry(5);
    for (let i = 0; i < 14000; i++) { c.fillStyle = R() > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; c.fillRect(R() * w, R() * h, 2, 2); }
    c.fillStyle = "#efe9dc"; c.fillRect(0, h * 0.04, w, h * 0.022); c.fillRect(0, h * 0.938, w, h * 0.022);
    c.fillStyle = "#f2c14e"; for (let x = 0; x < w; x += w / 2) c.fillRect(x, h * 0.49, w * 0.25, h * 0.02);
    c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(0, h * 0.25, w, h * 0.07); c.fillRect(0, h * 0.68, w, h * 0.07);
  }, [100, 1]);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(2400, 16), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.6 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -2.2); road.receiveShadow = true; S.add(road);
  // far dunes (static, far enough not to need parallax)
  const duneG = new THREE.PlaneGeometry(5000, 1400, 160, 40); duneG.rotateX(-Math.PI / 2);
  { const p = duneG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const f = clamp01((Math.abs(z) - 260) / 300); p.setY(i, f * (26 * Math.sin(x * 0.006) * Math.sin(x * 0.0021 + z * 0.004) + 30 + 14 * Math.sin(x * 0.017 + 1.3))); } duneG.computeVertexNormals(); }
  const dunes = new THREE.Mesh(duneG, new THREE.MeshStandardMaterial({ color: 0xd8b98f, roughness: 1 })); dunes.position.y = -0.5; S.add(dunes);

  // roadside "140 m" posts every 140 m (one passes each second at full speed)
  const postTex = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = "#121315"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#ff6b00"; c.fillRect(0, 0, 18, h);
    c.fillStyle = "#ffffff"; c.font = "700 120px Inter, Arial"; c.textBaseline = "middle"; c.fillText("140 m", 52, h * 0.47);
    c.fillStyle = "rgba(255,255,255,.55)"; c.font = "500 34px Inter, Arial"; c.fillText("PENANDA JARAK", 56, h * 0.85);
  });
  const posts = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0xd8dadf, metalness: 0.9, roughness: 0.3 }));
    pole.position.y = 1.1; g.add(pole);
    const brd = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.75, 0.05), [0, 0, 0, 0, 1, 0].map((k) => k ? new THREE.MeshStandardMaterial({ map: postTex, roughness: 0.4 }) : new THREE.MeshStandardMaterial({ color: 0x121315, roughness: 0.4 })));
    brd.position.set(0.7, 2.2, 0); g.add(brd);
    g.position.z = 6.4; g.traverse((m) => { if (m.isMesh) m.castShadow = true; }); S.add(g); posts.push(g);
  }

  // timing gantry with the AUDIRA board
  const gTex = canvasTex(1024, 256, (c, w, h) => {
    c.fillStyle = "#0e0f11"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#ff6b00"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = "#ffffff"; c.font = "800 120px Inter, Arial"; c.textBaseline = "middle"; c.fillText("AUDIRA", 46, h * 0.52);
    c.fillStyle = "#ff8a2a"; c.font = "600 54px JetBrains Mono, monospace"; c.fillText("TIMING", 560, h * 0.36);
    c.fillStyle = "rgba(255,255,255,.75)"; c.font = "500 40px JetBrains Mono, monospace"; c.fillText("SPEED TRAP 01", 560, h * 0.7);
  });
  const gantry = new THREE.Group();
  { const legM = new THREE.MeshStandardMaterial({ color: 0xd8dadf, metalness: 0.85, roughness: 0.28 });
    for (const z of [-10.6, 6.0]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6.6, 0.35), legM); lg.position.set(0, 3.3, z); gantry.add(lg); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 17.2), legM); beam.position.set(0, 6.5, -2.3); gantry.add(beam);
    const brd = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.7, 6.8), [new THREE.MeshStandardMaterial({ map: gTex, emissive: 0xffffff, emissiveMap: gTex, emissiveIntensity: 0.9 }), new THREE.MeshStandardMaterial({ color: 0x0e0f11 })].flatMap((m, i) => i === 0 ? [m] : [m, m, m, m, m]));
    brd.position.set(0, 5.4, 1.4); gantry.add(brd);
    gantry.traverse((m) => { if (m.isMesh) m.castShadow = true; }); }
  S.add(gantry);

  // ---------- car ----------
  const car = new THREE.Group(); S.add(car);
  const body = new THREE.Group(); car.add(body);
  const flake = canvasTex(256, 256, (c, w) => { const R = mulberry(77); c.fillStyle = "#808080"; c.fillRect(0, 0, w, w); for (let i = 0; i < 5000; i++) { const v = 100 + R() * 80; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(R() * w, R() * w, 1, 1); } }, [12, 6]);
  const paintM = new THREE.MeshPhysicalMaterial({ color: 0x2b2f35, metalness: 0.55, roughness: 0.32, roughnessMap: flake, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.3 });
  const carbonTex = canvasTex(256, 256, (c, w) => {
    c.fillStyle = "#16171a"; c.fillRect(0, 0, w, w);
    for (let y = 0; y < w; y += 16) for (let x = 0; x < w; x += 16) { const o = ((x + y) / 16) % 2; const g = c.createLinearGradient(x, y, o ? x + 16 : x, o ? y : y + 16); g.addColorStop(0, "#1c1e22"); g.addColorStop(0.5, "#34373d"); g.addColorStop(1, "#1c1e22"); c.fillStyle = g; c.fillRect(x + 1, y + 1, 14, 14); }
  }, [20, 20]);
  const carbonM = new THREE.MeshPhysicalMaterial({ map: carbonTex, metalness: 0.3, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0x0b0d10, metalness: 0.2, roughness: 0.03, clearcoat: 1, envMapIntensity: 1.6 });
  const orangeM = new THREE.MeshPhysicalMaterial({ color: 0xff6b00, roughness: 0.3, clearcoat: 0.6 });
  const aluM = new THREE.MeshStandardMaterial({ color: 0xd8dadf, metalness: 0.9, roughness: 0.26 });
  const darkAluM = new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.85, roughness: 0.3 });

  // body: superellipse cross-sections along the length, fender bulges, arch cut-outs around each wheel
  const U = 120, V = 64;
  const ht = (u) => pl(u, [0, 0.04, 0.14, 0.3, 0.55, 0.74, 0.9, 1], [0.6, 0.92, 0.98, 0.96, 0.9, 0.78, 0.62, 0.42]);
  const hb = (u) => pl(u, [0, 0.06, 0.94, 1], [0.34, 0.16, 0.16, 0.3]);
  const hw = (u) => {
    const fr = Math.exp(-Math.pow((u - 0.8) / 0.09, 2)) * 0.06, rr = Math.exp(-Math.pow((u - 0.2) / 0.1, 2)) * 0.08;
    return pl(u, [0, 0.05, 0.3, 0.55, 0.85, 0.97, 1], [0.7, 0.92, 0.96, 0.9, 0.93, 0.78, 0.55]) + fr + rr;
  };
  function surf(fx, nU, nV) {
    const pos = new Float32Array((nU + 1) * (nV + 1) * 3), uv = new Float32Array((nU + 1) * (nV + 1) * 2), idx = [];
    let k = 0;
    for (let i = 0; i <= nU; i++) for (let j = 0; j <= nV; j++) { const p = fx(i / nU, j / nV); pos[k * 3] = p[0]; pos[k * 3 + 1] = p[1]; pos[k * 3 + 2] = p[2]; uv[k * 2] = i / nU; uv[k * 2 + 1] = j / nV; k++; }
    for (let i = 0; i < nU; i++) for (let j = 0; j < nV; j++) { const a = i * (nV + 1) + j, b = a + nV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const wheelX = [WB, WB, -WB, -WB], wheelZ = [TZ, -TZ, TZ, -TZ];
  const bodyG = surf((u, v) => {
    const end = Math.pow(Math.sin(Math.PI * clamp01(u * 0.98 + 0.01)), 0.22);
    const a = v * Math.PI * 2, top = ht(u), bot = hb(u), mid = (top + bot) / 2, hy = (top - bot) / 2;
    let x = (u - 0.5) * L, y = mid + hy * sp(Math.sin(a), 3.2) * (0.6 + 0.4 * end), z = hw(u) * sp(Math.cos(a), 4.2) * end;
    if (Math.sin(a) > 0) y += 0.05 * Math.pow(Math.abs(Math.cos(a)), 6) * 0; // keep top flat
    for (const wx of [WB, -WB]) { const dx = x - wx, dy = y - WR, d = Math.hypot(dx, dy), R0 = WR + 0.07; if (Math.abs(z) > 0.5 && d < R0 && y < WR + R0) { const k = R0 / Math.max(d, 1e-3); x = wx + dx * k; y = Math.max(bot, WR + dy * k); } }
    return [x, y, z];
  }, U, V);
  const bodyM = new THREE.Mesh(bodyG, paintM); bodyM.castShadow = true; bodyM.receiveShadow = true; body.add(bodyM);
  // canopy (teardrop glasshouse)
  const canG = surf((u, v) => {
    const uu = lerp(0.3, 0.74, u), a = v * Math.PI;
    const rise = Math.pow(Math.sin(Math.PI * u), 0.7) * pl(u, [0, 0.4, 1], [0.24, 0.3, 0.2]);
    const base = ht(uu) - 0.06, w = 0.66 * Math.pow(Math.sin(Math.PI * u), 0.35) + 0.02;
    return [(uu - 0.5) * L, base + rise * sp(Math.sin(a), 2.6), w * sp(Math.cos(a), 3)];
  }, 60, 32);
  const canopy = new THREE.Mesh(canG, glassM); canopy.castShadow = true; body.add(canopy);
  // roof spine in paint + side intake strakes in carbon (breaks big plain surfaces)
  const roofG = surf((u, v) => { const uu = lerp(0.36, 0.7, u), a = v * Math.PI; const base = ht(uu) - 0.06 + Math.pow(Math.sin(Math.PI * lerp(0.14, 0.9, u)), 0.7) * 0.285 + 0.012; return [(uu - 0.5) * L, base + 0.02 * Math.sin(a), 0.2 * Math.cos(a) * Math.pow(Math.sin(Math.PI * u), 0.4)]; }, 40, 12);
  const roof = new THREE.Mesh(roofG, paintM); body.add(roof);
  const strakeG = new THREE.CapsuleGeometry(0.035, 0.9, 4, 10); strakeG.rotateZ(Math.PI / 2);
  for (const zs of [1, -1]) for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(strakeG, carbonM); m.position.set(-0.55 + k * 0.05, 0.42 + k * 0.1, zs * (0.93 - k * 0.012)); m.rotation.y = zs * 0.05; body.add(m); }
  // carbon splitter, skirts, diffuser, ducktail lip (no tall swan-neck wing)
  const rbox = (w, h, d, rad, mat) => { const sh = new THREE.Shape(); const x = -w / 2, y = -h / 2; sh.moveTo(x + rad, y); sh.lineTo(x + w - rad, y); sh.quadraticCurveTo(x + w, y, x + w, y + rad); sh.lineTo(x + w, y + h - rad); sh.quadraticCurveTo(x + w, y + h, x + w - rad, y + h); sh.lineTo(x + rad, y + h); sh.quadraticCurveTo(x, y + h, x, y + h - rad); sh.lineTo(x, y + rad); sh.quadraticCurveTo(x, y, x + rad, y); const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: rad * 0.6, bevelSize: rad * 0.6, bevelSegments: 3, curveSegments: 6 }); g.translate(0, 0, -d / 2); const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m; };
  const split = rbox(0.5, 0.04, 1.8, 0.015, carbonM); split.position.set(2.3, 0.14, 0); body.add(split);
  for (const zs of [1, -1]) { const sk = rbox(2.0, 0.06, 0.12, 0.02, carbonM); sk.position.set(0, 0.17, zs * 0.9); body.add(sk); }
  const diff = rbox(0.45, 0.16, 1.6, 0.03, carbonM); diff.position.set(-2.3, 0.22, 0); diff.rotation.z = 0.2; body.add(diff);
  const lip = rbox(0.28, 0.035, 1.75, 0.012, carbonM); lip.position.set(-2.36, 0.62, 0); lip.rotation.z = -0.22; body.add(lip);
  // lights: thin LED blade front, full-width bar rear (HDR so they bloom only at threshold)
  const ledM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 2.5, 2.35), toneMapped: false });
  const tailM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 0.25, 0.12), toneMapped: false });
  for (const zs of [1, -1]) { const h = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.42, 4, 8), ledM); h.rotation.set(Math.PI / 2, 0, 0); h.rotation.y = zs * 0.45; h.position.set(2.17, 0.5, zs * 0.55); body.add(h); }
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 1.5, 4, 8), tailM); tail.rotation.x = Math.PI / 2; tail.position.set(-2.43, 0.62, 0); body.add(tail);
  // number plates with AUDIRA (front and rear)
  const plateTex = canvasTex(520, 112, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.strokeStyle = "#121315"; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = "#121315"; c.font = "800 78px Inter, Arial"; c.textBaseline = "middle"; c.textAlign = "center"; c.fillText("AUDIRA", w / 2, h / 2 + 3); });
  const plateM = new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.4 });
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.112), plateM); pf.position.set(2.4, 0.3, 0); pf.rotation.y = Math.PI / 2; pf.rotation.x = 0; body.add(pf);
  const pr = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.112), plateM); pr.position.set(-2.46, 0.4, 0); pr.rotation.y = -Math.PI / 2; body.add(pr);
  // orange accent pin-stripe along the sill
  for (const zs of [1, -1]) { const st = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 2.2, 4, 6), orangeM); st.rotation.z = Math.PI / 2; st.position.set(0.05, 0.25, zs * 0.975); body.add(st); }

  // ---------- chassis (revealed when the body lifts) ----------
  const chassis = new THREE.Group(); car.add(chassis);
  const tub = rbox(3.9, 0.08, 1.6, 0.03, carbonM); tub.rotation.x = -Math.PI / 2; tub.position.set(0, 0.17, 0);
  { const tg = new THREE.Group(); const t2 = rbox(3.9, 1.6, 0.08, 0.04, carbonM); tg.add(t2); t2.rotation.x = Math.PI / 2; tg.position.y = 0.17; chassis.add(tg); }
  // battery tray with blade cells
  const trayM = new THREE.MeshStandardMaterial({ color: 0x3a3d42, metalness: 0.8, roughness: 0.35 });
  const tray = rbox(2.4, 1.3, 0.1, 0.03, trayM); tray.rotation.x = Math.PI / 2; tray.position.set(-0.05, 0.25, 0); chassis.add(tray);
  const NC = 6 * 22;
  const cellM = new THREE.MeshStandardMaterial({ color: 0xc9ccd2, metalness: 0.7, roughness: 0.32, emissive: 0x40ff9a, emissiveIntensity: 0 });
  const cellG = new THREE.BoxGeometry(0.36, 0.09, 0.045);
  const cells = new THREE.InstancedMesh(cellG, cellM, NC); cells.frustumCulled = false;
  { const dm = new THREE.Object3D(), cc = new THREE.Color(); let i = 0; for (let row = 0; row < 6; row++) for (let k = 0; k < 22; k++) { dm.position.set(-1.05 + row * 0.39 + 0.02, 0.35, -0.55 + k * 0.0524); dm.updateMatrix(); cells.setMatrixAt(i, dm.matrix); cc.setHSL(0.6, 0.04, 0.72 + 0.06 * ((row + k) % 2)); cells.setColorAt(i, cc); i++; } }
  chassis.add(cells);
  // pack lid label
  const packTex = canvasTex(512, 128, (c, w, h) => { c.fillStyle = "#121315"; c.fillRect(0, 0, w, h); c.fillStyle = "#ff6b00"; c.font = "800 64px JetBrains Mono, monospace"; c.textBaseline = "middle"; c.fillText("1.200 V", 24, h / 2); c.fillStyle = "#e8e8e8"; c.font = "600 30px Inter, Arial"; c.fillText("HIGH VOLTAGE", 300, h / 2); });
  const packLbl = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), new THREE.MeshStandardMaterial({ map: packTex, roughness: 0.5 })); packLbl.rotation.x = -Math.PI / 2; packLbl.position.set(1.32, 0.31, 0); packLbl.rotation.z = Math.PI / 2; chassis.add(packLbl);
  // motors at each wheel (housing with cutaway, copper stator, laminated rotor), inverter, half-shaft
  const lamTex = canvasTex(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 4) { c.fillStyle = x % 8 ? "#9aa0a8" : "#5d636b"; c.fillRect(x, 0, 4, h); } });
  const rotorM = new THREE.MeshStandardMaterial({ map: lamTex, metalness: 0.85, roughness: 0.3 });
  const copperM = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.95, roughness: 0.22, emissive: 0xff7a1a, emissiveIntensity: 0 });
  const housingM = new THREE.MeshStandardMaterial({ color: 0xd8dadf, metalness: 0.9, roughness: 0.24, side: THREE.DoubleSide });
  const invM = new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.7, roughness: 0.35 });
  const motors = [], rotors = [];
  const hvM = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.45, metalness: 0.1 });
  const hvCurves = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); const zs = Math.sign(wheelZ[i]);
    g.position.set(wheelX[i] - Math.sign(wheelX[i]) * 0.02, WR, zs * 0.4);
    const hous = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 40, 1, true, 0.3, Math.PI * 2 - 1.5), housingM); hous.rotation.x = Math.PI / 2; g.add(hous);
    const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.025, 40), housingM); cap1.rotation.x = Math.PI / 2; cap1.position.z = zs * 0.155; g.add(cap1);
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.03, 12, 40), copperM); g.add(st);
    const st2 = st.clone(); st2.position.z = 0.09; g.add(st2); const st3 = st.clone(); st3.position.z = -0.09; g.add(st3);
    const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.27, 32), rotorM); rot.rotation.x = Math.PI / 2; g.add(rot); rotors.push(rot);
    const inv = rbox(0.26, 0.09, 0.22, 0.02, invM); inv.position.set(0, 0.22, 0); g.add(inv);
    for (let f = 0; f < 5; f++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.008), aluM); fin.position.set(0, 0.28, -0.08 + f * 0.04); g.add(fin); }
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), darkAluM); shaft.rotation.x = Math.PI / 2; shaft.position.z = zs * 0.3; g.add(shaft);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    chassis.add(g); motors.push(g);
    // HV cable from pack front/rear edge to this inverter
    const sx = Math.sign(wheelX[i]);
    const c = new THREE.CatmullRomCurve3([v3(sx * 1.12, 0.33, zs * 0.25), v3(sx * 1.25, 0.42, zs * 0.3), v3(wheelX[i] - sx * 0.1, 0.55, zs * 0.38), v3(wheelX[i] - sx * 0.02, WR + 0.24, zs * 0.4)]);
    hvCurves.push(c);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.022, 10), hvM); tube.castShadow = true; chassis.add(tube);
  }
  // bus bar along the pack (orange, thicker)
  for (const zs of [1, -1]) { const bb = rbox(2.3, 0.04, 0.05, 0.012, hvM); bb.position.set(-0.05, 0.33, zs * 0.25); chassis.add(bb); }
  // current pulses on the HV cables (FX: HDR orange beads)
  const NP = 4 * 7;
  const pulseM = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.0, 1.6, 0.3), toneMapped: false });
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 12, 8), pulseM, NP); pulses.frustumCulled = false; chassis.add(pulses);

  // ---------- wheels ----------
  const tyreM = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.72, metalness: 0 });
  const tyreProf = []; { const n = 26; for (let k = 0; k <= n; k++) { const a = -Math.PI / 2 + Math.PI * 2 * k / n; tyreProf.push(new THREE.Vector2(0.27 + 0.08 * (1 + Math.cos(a)) * 0.5 + 0.0, (TW / 2) * Math.sin(a) * (Math.abs(Math.sin(a)) > 0.9 ? 1 : 1))); } }
  // tyre as torus-like lathe: radius from 0.255 (bead) to 0.35 (tread)
  const tyreShape = [];
  { const n = 40; for (let k = 0; k <= n; k++) { const a = Math.PI * 2 * k / n; const rr = 0.3 + 0.05 * sp(Math.cos(a), 5); const zz = (TW / 2) * sp(Math.sin(a), 5); tyreShape.push(new THREE.Vector2(rr, zz)); } }
  const tyreG = new THREE.LatheGeometry(tyreShape, 64); tyreG.rotateX(Math.PI / 2);
  const tyreCutG = new THREE.LatheGeometry(tyreShape, 64, 0.0, Math.PI * 1.55); tyreCutG.rotateX(Math.PI / 2);
  const rimFaceTex = canvasTex(512, 512, (c, w) => {
    c.translate(w / 2, w / 2);
    c.fillStyle = "#1a1b1e"; c.beginPath(); c.arc(0, 0, w / 2, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 10; k++) { c.save(); c.rotate(k * Math.PI / 5); const g = c.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, "#9aa0a8"); g.addColorStop(0.5, "#e9ebee"); g.addColorStop(1, "#80868e"); c.fillStyle = g; c.beginPath(); c.moveTo(40, -16); c.lineTo(w / 2 - 14, -26); c.lineTo(w / 2 - 14, 4); c.lineTo(40, 10); c.fill(); c.restore(); }
    c.fillStyle = "#c9ccd2"; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill(); c.fillStyle = "#ff6b00"; c.beginPath(); c.arc(0, 0, 16, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#d8dadf"; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, w / 2 - 8, 0, Math.PI * 2); c.stroke();
  });
  const blurTex = canvasTex(512, 512, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 40, w / 2, w / 2, w / 2); g.addColorStop(0, "#c9ccd2"); g.addColorStop(0.2, "#8a9098"); g.addColorStop(0.75, "#5a5f66"); g.addColorStop(0.95, "#c8cbd0"); g.addColorStop(1, "#1a1b1e"); c.fillStyle = g; c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); c.fill(); });
  const rimM = new THREE.MeshStandardMaterial({ map: rimFaceTex, metalness: 0.85, roughness: 0.25, transparent: true });
  const blurM = new THREE.MeshStandardMaterial({ map: blurTex, metalness: 0.8, roughness: 0.35, transparent: true, opacity: 0 });
  const wheels = [], spins = [], cutTyres = [];
  // tyre section layers (for s6): tread, belt (aramid yellow), carcass ply, inner liner
  const secGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const zs = Math.sign(wheelZ[i]);
    const wg = new THREE.Group(); wg.position.set(wheelX[i], WR, wheelZ[i]); car.add(wg); wheels.push(wg);
    const spin = new THREE.Group(); wg.add(spin); spins.push(spin);
    const ty = new THREE.Mesh(i === 0 ? tyreCutG : tyreG, tyreM); ty.castShadow = true; spin.add(ty);
    if (i === 0) { cutTyres.push(ty); const full = new THREE.Mesh(tyreG, tyreM); full.castShadow = true; spin.add(full); cutTyres.push(full); }
    const rface = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), rimM); rface.position.z = zs * 0.12; if (zs < 0) rface.rotation.y = Math.PI; spin.add(rface);
    const bface = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), blurM); bface.position.z = zs * 0.125; if (zs < 0) bface.rotation.y = Math.PI; spin.add(bface);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 48, 1, true), darkAluM); barrel.rotation.x = Math.PI / 2; spin.add(barrel);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 40), darkAluM); disc.rotation.x = Math.PI / 2; disc.position.z = zs * 0.04; spin.add(disc);
    const cal = rbox(0.16, 0.1, 0.07, 0.02, orangeM); cal.position.set(-Math.sign(wheelX[i]) * 0.0 + 0.0, 0.17, zs * 0.06); wg.add(cal);
  }
  // section face for the cut tyre: concentric layered half-rings in the cut plane (drawn as lathe slices)
  const layer = (r0, r1, zh, mat) => { const pts = [new THREE.Vector2(r0, -zh), new THREE.Vector2(r1, -zh), new THREE.Vector2(r1, zh), new THREE.Vector2(r0, zh), new THREE.Vector2(r0, -zh)]; const g = new THREE.LatheGeometry(pts, 48, Math.PI * 1.55, Math.PI * 0.45); g.rotateX(Math.PI / 2); return new THREE.Mesh(g, mat); };
  const beltM = new THREE.MeshStandardMaterial({ color: 0xe0b23a, roughness: 0.55, metalness: 0.1 });
  const plyM = new THREE.MeshStandardMaterial({ color: 0x8e949c, roughness: 0.5, metalness: 0.5 });
  const linerM = new THREE.MeshStandardMaterial({ color: 0x2e3036, roughness: 0.8 });
  const treadM = new THREE.MeshStandardMaterial({ color: 0x1d1e21, roughness: 0.8 });
  secGroup.add(layer(0.338, 0.35, TW / 2 - 0.01, treadM), layer(0.326, 0.338, TW / 2 - 0.02, beltM), layer(0.316, 0.326, TW / 2 - 0.015, plyM), layer(0.3, 0.316, TW / 2 - 0.02, linerM));
  spins[0].add(secGroup);
  // centrifugal pull arrows around the tread (instanced cones + shafts)
  const NA = 24;
  const arrM = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.35, metalness: 0.1, emissive: 0xff6b00, emissiveIntensity: 0.25 });
  const arrShaft = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 8).translate(0, 0.5, 0), arrM, NA); arrShaft.frustumCulled = false;
  const arrHead = new THREE.InstancedMesh(new THREE.ConeGeometry(0.018, 0.045, 12).translate(0, 0.0225, 0), arrM, NA); arrHead.frustumCulled = false;
  wheels[0].add(arrShaft, arrHead);

  // ---------- airflow streamlines + drag arrow (s3) ----------
  const flowU = { uT: { value: 0 }, uOp: { value: 0 }, uSp: { value: 1 } };
  const flowM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: flowU,
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vU;uniform float uT,uOp,uSp;void main(){float s=fract(vU.x*9.-uT*uSp);float d=smoothstep(0.,.08,s)*(1.-smoothstep(.35,.6,s));float e=smoothstep(0.,.08,vU.x)*smoothstep(1.,.85,vU.x);vec3 c=mix(vec3(.08,.3,.8),vec3(.25,.75,1.4),d);gl_FragColor=vec4(c,uOp*e*(.25+.75*d));}" });
  const flow = new THREE.Group(); car.add(flow);
  { const R = mulberry(14);
    for (let i = 0; i < 34; i++) {
      const z0 = (R() - 0.5) * 2.2, y0 = 0.25 + R() * 1.25;
      const pts = [];
      for (let k = 0; k <= 60; k++) {
        const x = 9 - k * 0.3; const u = clamp01((x + L / 2) / L);
        const inside = Math.abs(x) < L / 2 + 0.6 && Math.abs(z0) < hw(u) + 0.15;
        const topY = inside ? Math.max(ht(u) + (u > 0.3 && u < 0.74 ? 0.25 * Math.sin(Math.PI * (u - 0.3) / 0.44) : 0), 0) : 0;
        const bump = Math.exp(-Math.pow(x / 3.1, 2)) * Math.max(0, 1.45 - y0) * 0.55;
        const y = Math.max(y0 + bump, topY + 0.06 + 0.12 * Math.max(0, y0 - 0.25));
        const zz = z0 * (1 + 0.25 * Math.exp(-Math.pow((x - 1.5) / 2, 2)) * (Math.abs(z0) > 0.7 ? 1 : 0.3));
        pts.push(v3(x, y, zz));
      }
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.013, 6), flowM); m.frustumCulled = false; flow.add(m);
    }
  }
  const dragArrow = new THREE.Group();
  { const dM = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.3, metalness: 0.2, emissive: 0xff5a00, emissiveIntensity: 0.3 });
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 20).translate(0, 0.5, 0), dM); sh.rotation.z = Math.PI / 2; sh.name = "sh"; dragArrow.add(sh);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 24).translate(0, 0.17, 0), dM); hd.rotation.z = Math.PI / 2; hd.name = "hd"; dragArrow.add(hd); }
  dragArrow.position.set(L / 2 + 0.05, 0.55, 0); car.add(dragArrow);

  // ---------- speed streaks (FX) ----------
  const NS = 120;
  const strM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.35, 2.2), transparent: true, opacity: 0.0, toneMapped: false, depthWrite: false });
  const streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.012, 0.012), strM, NS); streaks.frustumCulled = false; S.add(streaks);
  const SD = []; { const R = mulberry(88); for (let i = 0; i < NS; i++) { const near = R() > 0.6; SD.push({ y: near ? 0.03 + R() * 0.25 : 0.15 + R() * 2.4, z: near ? 4 + R() * 5 : -(1.5 + R() * 5), ph: R() * 60, len: 3 + R() * 6 }); } }
  // contact shadow
  const csTex = canvasTex(256, 256, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(0,0,0,.75)"); g.addColorStop(0.6, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  const cs = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.9), new THREE.MeshBasicMaterial({ map: csTex, transparent: true, depthWrite: false })); cs.rotation.x = -Math.PI / 2; cs.position.y = 0.004; car.add(cs);

  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.3, 2.2);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());

  // ---------- timing functions ----------
  const VMAX = 139.8;
  const speedAt = (t) => {
    if (t < s.s3) return VMAX;
    if (t < s.s7) return VMAX * (1 - ramp(t, E.musuh - 0.2, E.musuh + 1.6));
    if (t < s.s8) return VMAX * ramp(t, E.lintasan - 0.6, E.lintasan + 1.4);
    return VMAX;
  };
  const distAt = (t) => { let d = 0; const dt = 0.01; for (let x = 0; x < t; x += dt) d += speedAt(x + dt * 0.5) * Math.min(dt, t - x); return d; };
  // inspection state 0..1 (body lifts / studio) and explode
  const liftAt = (t) => (t < s.s4 ? 0 : t < s.s7 ? eout(ramp(t, E.empat - 0.6, E.empat + 1.0)) : Math.max(-0.02, 1 - back(ramp(t, E.lintasan - 1.2, E.lintasan - 0.2), 1.2)));
  const look = (p, tg) => { cam.position.copy(p); cam.lookAt(tg); };
  const dmy = new THREE.Object3D();
  const gantryPass = [E.abu + 0.4, E.kurang + 0.3];

  // camera path keys: [t, px,py,pz, tx,ty,tz]
  const CAM = track([
    [0, 7.6, 0.7, 8.4, -0.4, 0.05, 0],
    [s.s1e, 8.0, 0.9, 9.2, -0.4, 0.15, 0],
    [s.s2 + 2.5, 10.5, 2.4, 11.5, -0.8, 0.4, 0],
    [E.abu, 13.0, 3.0, 7.5, -0.5, 1.5, -1.0],
    [E.inilah, -8.5, 1.6, 9.5, 0.4, 0.2, 0],
    [s.s2e, -6.0, 1.3, 9.5, 1.2, 0.2, 0],
    [s.s3 + 2, 7.0, 1.0, 9.0, 0.6, 0.35, 0],
    [s.s3e, 7.8, 2.6, 7.6, 0.2, 0.45, 0],
    [s.s4 + 1.5, 6.0, 4.6, 7.2, 0.0, 0.5, 0],
    [E.tiap, 3.6, 2.4, 4.4, 1.2, 0.35, 0.3],
    [s.s4e, 2.5, 1.6, 3.4, 1.4, 0.35, 0.4],
    [s.s5 + 1.2, 2.8, 5.6, 5.0, -0.1, 0.1, 0],
    [E.panas, -2.6, 4.2, 4.2, 0.3, 0.1, 0.1],
    [s.s5e, 2.4, 1.2, 2.6, 1.4, 0.36, 0.7],
    [s.s6 + 1.5, 3.6, 1.0, 3.3, 1.45, 0.25, 0.84],
    [E.selebar, 3.1, 0.75, 2.85, 1.48, 0.28, 0.84],
    [s.s6e, 3.2, 0.9, 3.4, 1.2, 0.4, 0.5],
    [E.lintasan - 0.4, 5.5, 2.4, 6.8, 0.2, 0.45, 0],
    [E.kurang, -10.5, 2.3, 8.8, 0.5, 0.0, 0],
    [s.s7e, -11.5, 2.6, 7.4, 0.8, 0.0, 0],
    [s.s8 + 2.5, 3.0, 1.3, 9.8, 0.0, 0.3, 0],
    [s.dur, 7.5, 3.4, 10.5, -0.3, 0.2, 0],
  ]);

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const v = speedAt(t), d = distAt(t), vf = v / VMAX;
    const lift = liftAt(t);
    const insp = t >= s.s3 && t < s.s7 + 3 ? ramp(t, E.musuh - 0.2, E.musuh + 1.6) * (1 - ramp(t, E.lintasan - 0.8, E.lintasan + 0.8)) : 0;
    // ground motion
    roadTex.offset.x = (d / 24) % 1;
    sandTex.offset.x = (d / 20) % 1;
    for (let i = 0; i < posts.length; i++) { const x = ((-(d % 140) + i * 140 + 140 * 2) % 700) - 140 * 2 + 25; posts[i].position.x = x; posts[i].visible = Math.abs(x) < 300; }
    // gantry: positioned so the car passes under it at gantryPass times
    let gx = 1e4; for (const tp of gantryPass) { const x = distAt(tp) - d; if (Math.abs(x) < Math.abs(gx)) gx = x; }
    gantry.position.x = gx + 1.2; gantry.visible = Math.abs(gx) < 600;
    // wheels spin; rim fades to a blurred disc at speed
    const ang = -d / WR;
    for (const sp_ of spins) sp_.rotation.z = ang;
    { const tg = 3.02 + 2 * Math.PI * Math.round((ang - 3.02) / (2 * Math.PI)); const k = t >= s.s6 && t < s.s7 ? ramp(t, s.s6 - 0.2, E.tapi + 0.9) : 0; spins[0].rotation.z = lerp(ang, tg, k); }
    rimM.opacity = 1 - 0.85 * clamp01((vf - 0.15) * 2);
    blurM.opacity = 0.9 * clamp01((vf - 0.15) * 2);
    // body lift (exploded) and inspection
    body.position.y = 1.15 * lift;
    body.position.x = 0;
    // highway micro-vibration at speed (deterministic)
    car.position.y = vf * 0.004 * Math.sin(t * 61) ;
    // motors: rotor spin slows with the freeze but the s4 counter drives a showcase spin
    const showSpin = t >= s.s4 && t < s.s7 ? ramp(t, E.berputar - 0.5, E.berputar + 2.0) : 0;
    const rotA = ang * 7.9 + showSpin * (t - E.berputar) * 40;
    for (const ro of rotors) ro.rotation.y = rotA;
    copperM.emissiveIntensity = t >= s.s4 && t < s.s5 ? 0.6 * ramp(t, E.roda - 0.3, E.roda + 0.6) * (1 - ramp(t, s.s4e - 0.6, s.s4e)) : 0;
    // battery: cells breathe green on volt, drain row by row in s7
    const drain = t >= s.s7 ? ramp(t, E.penuh - 0.4, E.lintasan - 0.8) : 0;
    const showCells = t >= s.s5 && t < s.s7 + 4 ? ramp(t, s.s5, E.volt + 0.4) : 0;
    cellM.emissiveIntensity = 0.14 * showCells * (1 - drain);
    // pulses along HV cables: dense + slow current (1,200 V = less current)
    const pOn = t >= s.s5 && t < s.s6 ? ramp(t, E.volt - 0.3, E.volt + 0.5) : t >= s.s7 && t < E.lintasan ? 0.8 : 0;
    for (let i = 0; i < NP; i++) {
      const c = hvCurves[i % 4], k = Math.floor(i / 4);
      const u = ((t * 0.55 + k / 7) % 1);
      dmy.position.copy(c.getPoint(u)); dmy.scale.setScalar(pOn * (0.7 + 0.3 * Math.sin(u * 3.14))); dmy.updateMatrix(); pulses.setMatrixAt(i, dmy.matrix);
    }
    pulses.instanceMatrix.needsUpdate = true;
    chassis.visible = lift > 0.001 || (t >= s.s4 && t < s.s7 + 3);
    // tyre section (s6): swap full tyre for cut tyre + layers, centrifugal arrows grow
    const sec = t >= s.s6 && t < s.s7 ? ramp(t, E.tapi + 0.2, E.karet) : 0;
    cutTyres[1].visible = sec < 0.5; cutTyres[0].visible = sec >= 0.5; secGroup.visible = sec >= 0.5;
    const pull = t >= s.s6 && t < s.s7 ? ramp(t, E.sentri - 0.3, E.sentri + 1.4) : 0;
    for (let i = 0; i < NA; i++) {
      const a = i / NA * Math.PI * 2, len = 0.04 + 0.16 * pull * (0.8 + 0.2 * Math.sin(t * 6 + i));
      const zz = (i % 2 ? 1 : -1) * 0.07 + 0.0;
      dmy.position.set(Math.cos(a) * 0.36, Math.sin(a) * 0.36, TZ * 0 + zz + 0.0); dmy.rotation.set(0, 0, a - Math.PI / 2); dmy.scale.set(pull > 0.01 ? 1 : 0, len, pull > 0.01 ? 1 : 0); dmy.updateMatrix(); arrShaft.setMatrixAt(i, dmy.matrix);
      dmy.position.set(Math.cos(a) * (0.36 + len), Math.sin(a) * (0.36 + len), zz); dmy.scale.setScalar(pull > 0.01 ? 0.6 + 0.6 * pull : 0); dmy.updateMatrix(); arrHead.setMatrixAt(i, dmy.matrix);
    }
    arrShaft.instanceMatrix.needsUpdate = arrHead.instanceMatrix.needsUpdate = true;
    // airflow + drag arrow (s3): grows with the cube law beat
    const fOn = t >= s.s3 && t < s.s4 + 0.6 ? ramp(t, E.musuh - 0.4, E.musuh + 0.6) * (1 - ramp(t, s.s4 - 0.2, s.s4 + 0.6)) : t >= s.s1 && t < s.s2 ? 0 : 0;
    flowU.uT.value = t; flowU.uOp.value = 0.9 * fOn;
    const cube = t < E.dua ? 1 : 1 + 7 * eout(ramp(t, E.delapan - 0.6, E.delapan + 0.8));
    const spd = t < E.dua ? 1 : 1 + eout(ramp(t, E.dua, E.dua + 1.2));
    flowU.uSp.value = 0.9 * spd;
    flow.visible = fOn > 0.001;
    const da = fOn * ramp(t, E.hambatan - 0.4, E.hambatan + 0.8);
    dragArrow.visible = da > 0.001;
    dragArrow.getObjectByName("sh").scale.set(1, 0.25 * cube * da + 0.001, 1);
    dragArrow.getObjectByName("hd").position.x = 0;
    dragArrow.getObjectByName("hd").position.x = 0.25 * cube * da;
    dragArrow.getObjectByName("sh").position.x = 0;
    // speed streaks
    strM.opacity = 0.7 * clamp01(vf * 1.2 - 0.2) * (1 - insp);
    for (let i = 0; i < NS; i++) {
      const q = SD[i]; const x = 40 - ((d * 0.9 + q.ph * 3) % 80);
      dmy.position.set(x, q.y, q.z); dmy.rotation.set(0, 0, 0); dmy.scale.set(q.len * (0.3 + 0.7 * vf), 1, 1); dmy.updateMatrix(); streaks.setMatrixAt(i, dmy.matrix);
    }
    streaks.instanceMatrix.needsUpdate = true;
    // lighting mood: inspection = studio (env up, key a bit stronger, macro glow toward 0)
    S.environmentIntensity = 0.5 + 0.25 * insp;
    key.intensity = 1.6 + 0.6 * insp; key.target.position.set(0, 0, 0);
    const macro = t >= s.s6 - 0.5 && t < s.s7 ? 1 : 0;
    bloom.strength = 0.35 * (1 - 0.95 * macro);
    // camera
    const c = CAM(t);
    look(v3(c[0], c[1], c[2]), v3(c[3], c[4], c[5]));
    if (vf > 0.5 && insp < 0.01) { cam.position.y += 0.012 * vf * Math.sin(t * 37.0); cam.position.z += 0.01 * vf * Math.sin(t * 23.0 + 1); }
    comp.render();
  };
}
