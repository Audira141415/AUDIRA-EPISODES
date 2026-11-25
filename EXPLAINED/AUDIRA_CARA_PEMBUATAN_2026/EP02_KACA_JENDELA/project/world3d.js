// EP02 KACA JENDELA (GLASSCRAFT): one float-glass line laid out left to right in a dark optical studio.
// Batch hoppers -> furnace -> canal + tweel -> molten-tin bath -> lehr tunnel -> cutting bridge -> a finished window pane.
// Every hero glass object has a saturated light disc or an emissive backplate behind it (transmission glass on a black void
// goes dark otherwise), and the molten glass + tin are lit warm orange-gold so the process reads.
// Illustration only: own simplified machines, generic faceless figures with name plates. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, std, stage, pts, envStrips, label } from "./lib3d.js";

const AMBER = 0xffa53a, GOLD = 0xffc56b, CYAN = 0x2fe6ff, MAG = 0xf27bff, VOID = 0x05070b;
const FONT = "Outfit, 'Segoe UI', sans-serif", MONO = "'JetBrains Mono', Consolas, monospace";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };

const glassM = (o = {}) => new THREE.MeshPhysicalMaterial({ color: 0xeef8ff, roughness: 0.06, metalness: 0, transmission: 0.95, ior: 1.52, thickness: 0.6,
  clearcoat: 0.5, clearcoatRoughness: 0.08, specularIntensity: 1, side: THREE.DoubleSide, ...o });
const frostM = (o = {}) => glassM({ roughness: 0.32, transmission: 0.9, thickness: 1.0, color: 0xf2f6fb, ...o });

// radial light disc (the GLASSCRAFT backplate): bright rim, soft core, saturated colour
function discTex(col) {
  const c = new THREE.Color(col), rgb = (a) => `rgba(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0},${a})`;
  return canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#05070b"; g.fillRect(0, 0, w, w);
    const r = w / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, rgb(0.55)); gr.addColorStop(0.55, rgb(0.42)); gr.addColorStop(0.86, rgb(0.85)); gr.addColorStop(0.9, rgb(1)); gr.addColorStop(0.94, rgb(0.35)); gr.addColorStop(1, rgb(0));
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
}
const lathe = (p, seg = 22) => new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(r, y)), seg);

// Generic faceless figure: head on a neck, shoulders wider than hips, bent elbows and knees, skin unlike the clothes.
function person({ h = 1.8, cloth = 0x2b3a55, trouser = 0x1c2230, skin = 0xd6a47c, hair = 0x2a1d14 }) {
  const G = new THREE.Group(), B = new THREE.Group(); G.add(B); B.scale.setScalar(h / 1.8);
  const cM = std(cloth, 0.62, 0.05), tM = std(trouser, 0.7), sM = std(skin, 0.55), hM = std(hair, 0.7), shoeM = std(0x111214, 0.4);
  const add = (geo, m, x, y, z, p = B) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
  const leg = (x) => {
    const hip = new THREE.Group(); hip.position.set(x, 0.9, 0); B.add(hip);
    add(new THREE.CapsuleGeometry(0.075, 0.32, 6, 12), tM, 0, -0.2, 0, hip);
    const kn = new THREE.Group(); kn.position.y = -0.43; hip.add(kn);
    add(new THREE.CapsuleGeometry(0.062, 0.32, 6, 12), tM, 0, -0.2, 0, kn);
    add(new THREE.SphereGeometry(0.07, 12, 8), shoeM, 0, -0.43, 0.05, kn).scale.set(0.85, 0.5, 1.7);
    return { hip, kn };
  };
  const legL = leg(-0.1), legR = leg(0.1);
  add(lathe([[0.001, 0.84], [0.15, 0.86], [0.16, 0.96], [0.15, 1.03], [0.001, 1.03]]), tM, 0, 0, 0).scale.set(1.1, 1, 0.75);
  add(lathe([[0.001, 0.95], [0.15, 0.96], [0.155, 1.08], [0.18, 1.26], [0.21, 1.4], [0.2, 1.47], [0.12, 1.53], [0.05, 1.56], [0.001, 1.565]]), cM, 0, 0, 0).scale.set(1.38, 1, 0.72);
  const hp = new THREE.Group(); hp.position.set(0, 1.55, 0); B.add(hp);
  add(new THREE.CylinderGeometry(0.045, 0.052, 0.1, 12), sM, 0, 0.03, 0, hp);
  add(new THREE.SphereGeometry(0.1, 20, 16), sM, 0, 0.15, 0.01, hp).scale.set(0.88, 1.12, 0.98);
  add(new THREE.SphereGeometry(0.104, 18, 10, 0, 6.3, 0, 1.35), hM, 0, 0.175, -0.008, hp);
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.255, 1.43, 0); B.add(sh);
    add(new THREE.SphereGeometry(0.07, 12, 10), cM, 0, 0, 0, sh);
    add(new THREE.CapsuleGeometry(0.06, 0.22, 6, 12), cM, 0, -0.15, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
    add(new THREE.CapsuleGeometry(0.052, 0.2, 6, 12), cM, 0, -0.13, 0, el);
    add(new THREE.SphereGeometry(0.047, 12, 10), sM, 0, -0.28, 0.01, el).scale.set(0.8, 1.15, 1);
    return { sh, el };
  };
  const armL = arm(-1), armR = arm(1);
  return { G, legL, legR, armL, armR, head: hp };
}
function pose(p, { reachR = 0, reachL = 0, headY = 0, headX = 0, knee = 0.12 }) {
  p.legL.hip.rotation.x = -0.06; p.legR.hip.rotation.x = -0.02; p.legL.kn.rotation.x = knee; p.legR.kn.rotation.x = knee * 0.6;
  p.armL.sh.rotation.set(-0.15 - reachL * 1.0, 0, 0.12); p.armL.el.rotation.x = -0.5 - reachL * 0.6;
  p.armR.sh.rotation.set(-0.15 - reachR * 1.0, 0, -0.12); p.armR.el.rotation.x = -0.5 - reachR * 0.6;
  p.head.rotation.set(headX, headY, 0);
}

// ribbon in the XZ plane: x0..x1, full width w(x), facing +y
function ribbonGeo(x0, x1, w, seg = 96) {
  const g = new THREE.PlaneGeometry(1, 1, seg, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) + 0.5, x = x0 + u * (x1 - x0); p.setXYZ(i, x, 0, -p.getY(i) * w(x)); }
  g.computeVertexNormals();
  return g;
}
const gradTex = (stops) => canvasTex(512, 4, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); for (const [o, c] of stops) gr.addColorStop(o, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: VOID, fog: 0.012, exp: 1.0, bloom: [0.6, 0.55, 0.8] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  envStrips(r, scene, [[8, 2.5, 0xffb768, 0.55, 0, 7, 4], [2, 5, 0xffffff, 1.6, 6, 3, 5], [3, 6, CYAN, 1.6, -7, 2, -3], [3, 6, MAG, 1.5, 7, 2, -3], [10, 2, AMBER, 1.8, 0, -1, 7], [4, 4, 0xffffff, 0.9, 0, 3, -8]], 0x07090e);
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0x8fa2c8, 0x0a0a10, 0.5));
  const A = (k) => AT[k];
  const rnd = mulberry(1959);
  const add = (geo, m, x = 0, y = 0, z = 0, p = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
  const bx = (w, h, d, m, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, p);

  // ---------- studio: obsidian floor with a faint grid, light discs behind every station ----------
  const floorT = canvasTex(512, 512, (g, w) => { g.fillStyle = "#0b0e14"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(140,190,255,.10)"; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, w); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [40, 12]);
  const floor = add(new THREE.PlaneGeometry(160, 48), std(0xffffff, 0.32, 0.35, { map: floorT })); floor.rotation.x = -Math.PI / 2; floor.position.z = -2; floor.castShadow = false;
  const discs = [];
  const disc = (x, y, z, rad, col, k = 1) => { const m = new THREE.Mesh(new THREE.CircleGeometry(rad, 64), new THREE.MeshBasicMaterial({ map: discTex(col), color: new THREE.Color(k, k, k), fog: false })); m.position.set(x, y, z); scene.add(m); discs.push(m); return m; };
  const dBath = disc(-2.5, 3.0, -9.5, 6.2, AMBER, 0.95), dInv = disc(-7.2, 2.3, -8.2, 3.0, MAG, 0.9);
  disc(-27.5, 3.0, -7.5, 5.2, CYAN, 0.85); disc(-17, 3.0, -7.0, 4.4, AMBER, 0.9);
  disc(14, 3.2, -8.5, 5.0, MAG, 0.75); disc(24, 3.0, -7.5, 3.8, CYAN, 0.8);
  const dPaneA = disc(32.4, 2.6, -3.2, 3.1, 0x7fd8c4, 0.85), dPaneB = disc(34.2, 1.9, -4.0, 2.4, CYAN, 0.8);

  // ---------- lights ----------
  const key = new THREE.DirectionalLight(0xfff4e6, 2.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 50 }); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const rimC = new THREE.PointLight(CYAN, 30, 14, 2), rimM = new THREE.PointLight(MAG, 30, 14, 2); scene.add(rimC, rimM);
  const warm = [-8.5, -4.5, -0.5, 3.5].map((x, i) => { const l = new THREE.PointLight(i < 2 ? 0xff9a3c : 0xdfeaff, i < 2 ? 6 : 4, 7, 2); l.position.set(x, 2.8, 2.4); scene.add(l); return l; });

  // ---------- STATION 1: batch hoppers on a conveyor (x -31..-23.5) ----------
  const ING = [["PASIR", 0xd8b673, "s3:Pasir"], ["SODA ABU", 0xf1f1ec, "s3:soda"], ["DOLOMIT", 0xa79f95, "s3:dolomit"], ["BATU KAPUR", 0xe6dfcc, "s3:batu"], ["SODIUM SULFAT", 0xe9d468, "s3:sodium"], ["PECAHAN KACA", 0x7fe3d0, "s3:pecahan"]];
  const hop = ING.map(([nm, col, w], i) => {
    const x = -31 + i * 1.5, G = new THREE.Group(); G.position.set(x, 0, -1.4); scene.add(G);
    add(new THREE.CylinderGeometry(0.46, 0.46, 1.5, 40, 1, true), glassM({ thickness: 0.2 }), 0, 2.05, 0, G);
    add(new THREE.ConeGeometry(0.46, 0.5, 40, 1, true), glassM({ thickness: 0.2 }), 0, 1.05, 0, G).rotation.x = Math.PI;
    const fillM = std(col, i === 5 ? 0.15 : 0.85, 0, { emissive: new THREE.Color(col), emissiveIntensity: 0 });
    const fill = add(i === 5 ? new THREE.IcosahedronGeometry(0.34, 0) : new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32), i === 5 ? glassM({ color: 0x9ff5e2, thickness: 0.4 }) : fillM, 0, 1.75, 0, G);
    if (i === 5) for (let k = 0; k < 7; k++) add(new THREE.TetrahedronGeometry(0.16 + 0.05 * (k % 3), 0), glassM({ color: 0x9ff5e2 }), (rnd() - 0.5) * 0.5, 1.45 + rnd() * 0.7, (rnd() - 0.5) * 0.5, G).rotation.set(rnd() * 3, rnd() * 3, 0);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), std(0x9aa3b2, 0.3, 0.9), s * 0.38, 0.5, 0, G);
    const ring = add(new THREE.TorusGeometry(0.5, 0.025, 8, 48), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, toneMapped: false }), 0, 2.82, 0, G); ring.rotation.x = Math.PI / 2;
    const lb = label(nm, { w: 512, h: 96, font: `700 46px ${FONT}`, color: "#eaf6ff", size: 1.25 }); lb.position.set(0, 0.25, 0.75); G.add(lb);
    return { G, fill, fillM, ring, w, lb };
  });
  bx(12, 0.14, 1.0, std(0x1a1f29, 0.4, 0.6), -25.6, 0.62, 0.6);
  for (let i = 0; i < 12; i++) add(new THREE.CylinderGeometry(0.06, 0.06, 1.05, 12), std(0x8b94a6, 0.3, 0.9), -31.2 + i, 0.5, 0.6).rotation.x = Math.PI / 2;
  const batch = pts(scene, 200, { size: 0.16, add: false });
  const batchSeed = Array.from({ length: 200 }, (_, i) => [rnd(), rnd(), i % 6]);
  batchSeed.forEach((s, i) => { const c = new THREE.Color(ING[s[2]][1]); batch.col.set([c.r, c.g, c.b], i * 3); });

  // ---------- STATION 2: furnace (x -20..-14), frosted glass shell with a molten pool inside ----------
  const FX = -17;
  bx(6.4, 0.3, 4.4, std(0x262a33, 0.6, 0.3), FX, 0.15, 0);
  const shellM = glassM({ color: 0xfff0e0, roughness: 0.1, thickness: 0.3 });
  for (const [w, d, x, z] of [[6.2, 0.08, 0, 2.06], [6.2, 0.08, 0, -2.06], [0.08, 4.2, -3.06, 0], [0.08, 4.2, 3.06, 0]]) bx(w, 2.8, d, shellM, FX + x, 1.7, z).castShadow = false;
  for (let i = 0; i < 5; i++) bx(0.12, 0.12, 4.3, std(0x9aa3b2, 0.3, 0.9), FX - 2.6 + i * 1.3, 3.12, 0);
  const poolM = new THREE.MeshStandardMaterial({ color: 0x331000, emissive: new THREE.Color(0xff7a1c), emissiveIntensity: 2.2, roughness: 0.3 });
  bx(5.6, 0.5, 3.6, poolM, FX, 0.6, 0);
  const lumps = Array.from({ length: 12 }, (_, i) => bx(0.35 + 0.2 * rnd(), 0.18, 0.35 + 0.2 * rnd(), std(0xe8dcc0, 0.9), FX - 2.5 + (i % 4) * 0.45 + rnd() * 0.2, 0.9, -1.2 + Math.floor(i / 4) * 1.1 + rnd() * 0.3));
  const fLight = new THREE.PointLight(0xff8a2a, 60, 9, 2); fLight.position.set(FX, 1.8, 0.4); scene.add(fLight);
  const flame = pts(scene, 140, { color: 0xffb04a, size: 0.28 });
  const flameSeed = Array.from({ length: 140 }, () => [rnd(), rnd(), rnd()]);
  const plate = label("AUDIRA · TUNGKU", { w: 768, h: 120, font: `700 62px ${FONT}`, color: "#fff2df", bg: "rgba(20,14,10,.55)", size: 2.6 }); plate.position.set(FX, 2.6, 2.15); scene.add(plate);

  // ---------- canal + tweel (x -14..-10) ----------
  bx(4.2, 0.7, 1.4, std(0x2a2e38, 0.55, 0.3), -12, 0.35, 0);
  const canalM = new THREE.MeshStandardMaterial({ color: 0x2a0d00, emissive: new THREE.Color(0xff8a22), emissiveIntensity: 1.0, roughness: 0.2 });
  bx(4.2, 0.06, 0.8, canalM, -12, 0.72, 0);
  const tweel = bx(0.16, 0.9, 1.3, frostM({ color: 0xcfe9ff }), -12.4, 1.15, 0);
  bx(0.5, 0.12, 1.0, std(0x3a3f4a, 0.4, 0.5), -10.1, 0.74, 0); // spout lip
  const spoutL = new THREE.PointLight(0xff8a2a, 10, 6, 2); spoutL.position.set(-9.6, 1.3, 0.3); scene.add(spoutL);

  // ---------- STATION 3: tin bath (x -10..6.2) with the floating ribbon ----------
  const BX0 = -10, BX1 = 6.2, BL = BX1 - BX0, TIN_Y = 0.8;
  bx(BL + 0.6, 0.7, 5.2, std(0x1d222c, 0.55, 0.35), (BX0 + BX1) / 2, 0.35, 0);
  const tinN = canvasTex(256, 256, (g, w) => { const im = g.createImageData(w, w); for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const a = Math.sin((x / w) * Math.PI * 6 + Math.sin((y / w) * Math.PI * 4) * 1.2), b = Math.sin((y / w) * Math.PI * 4 + Math.sin((x / w) * Math.PI * 2) * 0.8); const o = (y * w + x) * 4; im.data[o] = 128 + 22 * a; im.data[o + 1] = 128 + 22 * b; im.data[o + 2] = 255; im.data[o + 3] = 255; } g.putImageData(im, 0, 0); }, [6, 2]);
  const tinE = canvasTex(512, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3a4250"); gr.addColorStop(0.18, "#8d97a8"); gr.addColorStop(0.32, "#4a5262"); gr.addColorStop(0.5, "#2c323e"); gr.addColorStop(0.68, "#4a5262"); gr.addColorStop(0.82, "#9aa4b4"); gr.addColorStop(1, "#3a4250"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const tinM = new THREE.MeshStandardMaterial({ color: 0xd4dbe6, metalness: 0.9, roughness: 0.16, normalMap: tinN, normalScale: new THREE.Vector2(0.3, 0.3), emissive: new THREE.Color(0xffffff), emissiveMap: tinE, emissiveIntensity: 0.55 });
  const tin = bx(BL, 0.1, 4.6, tinM, (BX0 + BX1) / 2, TIN_Y - 0.05, 0); tin.castShadow = false;
  const wOf = (x) => 0.8 + 2.3 * smooth((x - BX0) / 3.2);
  // glow only where the glass is still hot (canal end), clear float glass downstream so the silver tin shows through
  const ribEm = gradTex([[0, "#ffb347"], [0.1, "#ff8a22"], [0.24, "#b8400a"], [0.42, "#3a0e02"], [0.6, "#000000"], [1, "#000000"]]);
  const ribM = new THREE.MeshPhysicalMaterial({ color: 0x9fd8c4, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.18, transparent: true, opacity: 0.62, depthWrite: false, emissive: new THREE.Color(0xffffff), emissiveMap: ribEm, emissiveIntensity: 1.0, side: THREE.DoubleSide });
  const rib = add(ribbonGeo(BX0, BX1, wOf), ribM, 0, TIN_Y + 0.025, 0); rib.castShadow = false;
  const edgeM = new THREE.MeshBasicMaterial({ color: 0xc8fff0, toneMapped: false, transparent: true, opacity: 0.85 });
  for (const s of [-1, 1]) { const pts2 = []; for (let i = 0; i <= 60; i++) { const x = BX0 + (BL * i) / 60; pts2.push(new THREE.Vector3(x, TIN_Y + 0.04, (s * wOf(x)) / 2)); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 80, 0.035, 8), edgeM); }
  const sheenT = canvasTex(256, 16, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(230,240,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sheens = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.5), new THREE.MeshBasicMaterial({ map: sheenT, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = TIN_Y + 0.006; scene.add(m); return m; });
  const side = label("AUDIRA FLOAT LINE", { w: 1024, h: 96, font: `700 54px ${FONT}`, color: "#8fa6c4", size: 3.2 }); side.position.set(-6.5, 0.36, 2.62); scene.add(side);
  const flow = pts(scene, 260, { color: 0xffd68a, size: 0.07, opacity: 0.5 });
  const flowSeed = Array.from({ length: 260 }, () => [rnd(), rnd() - 0.5, rnd()]);
  // gas blanket canopy (N2 + H2) and gas motes
  const canopyM = frostM({ color: 0xbfefff, roughness: 0.25, transmission: 0.95, transparent: true, opacity: 0 });
  const canopy = bx(BL, 1.4, 5.0, canopyM, (BX0 + BX1) / 2, 1.55, 0); canopy.castShadow = false;
  const gasL = label("N₂ + H₂", { w: 512, h: 128, font: `700 84px ${MONO}`, color: "#9ff0ff", size: 2.0 }); gasL.position.set(-2.5, 2.6, 2.6); scene.add(gasL);
  const gas = pts(scene, 120, { color: 0x9ff0ff, size: 0.09, opacity: 0.8 });
  const gasSeed = Array.from({ length: 120 }, () => [rnd(), rnd(), rnd()]);
  // top rollers at both edges
  const rollers = [];
  for (const x of [-3, -0.6, 1.8]) for (const s of [-1, 1]) {
    const G = new THREE.Group(); G.position.set(x, TIN_Y + 0.1, s * 1.88); scene.add(G);
    const arm = bx(0.12, 0.12, 1.4, std(0x9aa3b2, 0.25, 0.9), 0, 0.25, s * 0.7, G); arm.rotation.x = s * 0.25;
    const wh = add(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), std(0xb7c0cf, 0.2, 0.95), 0, 0, 0, G); wh.rotation.x = Math.PI / 2;
    const glow = add(new THREE.TorusGeometry(0.2, 0.018, 8, 40), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true, opacity: 0 }), 0, 0, 0, G);
    rollers.push({ wh, glow, G });
  }
  const t600 = label("±600°C", { w: 512, h: 128, font: `800 88px ${MONO}`, color: "#ffb36b", size: 1.6 }); t600.position.set(6.6, 1.75, 1.2); scene.add(t600);

  // ---------- STATION 4: lehr tunnel (x 6.2..21) ----------
  const LX0 = BX1, LX1 = 22.5;
  const lehrEm = gradTex([[0, "#5a2a08"], [0.08, "#1a0a02"], [0.16, "#000000"], [1, "#000000"]]);
  const lehrM = new THREE.MeshPhysicalMaterial({ color: 0xb4e4d2, roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true, opacity: 0.7, depthWrite: false, emissive: new THREE.Color(0xffffff), emissiveMap: lehrEm, emissiveIntensity: 1.0, side: THREE.DoubleSide });
  const lehrFill = new THREE.PointLight(0xcfe8ff, 14, 12, 2); lehrFill.position.set(14, 1.2, 4.5); scene.add(lehrFill);
  add(ribbonGeo(LX0, LX1, () => 3.7, 40), lehrM, 0, TIN_Y + 0.03, 0).castShadow = false;
  for (const zz of [-1.85, 1.85]) add(new THREE.CylinderGeometry(0.035, 0.035, LX1 - LX0, 8), edgeM, (LX0 + LX1) / 2, TIN_Y + 0.05, zz).rotation.z = Math.PI / 2;
  for (let x = LX0 + 0.6; x < LX1; x += 0.9) add(new THREE.CylinderGeometry(0.09, 0.09, 4.2, 16), std(0x2e333d, 0.45, 0.7), x, TIN_Y - 0.08, 0).rotation.x = Math.PI / 2;
  bx(LX1 - LX0, 0.55, 4.6, std(0x1a1e27, 0.55, 0.3), (LX0 + LX1) / 2, 0.27, 0);
  const archM = frostM({ color: 0xf6e9ff, roughness: 0.3, transmission: 0.92 });
  for (let x = 8.5; x < 20.5; x += 1.5) { const a = add(new THREE.TorusGeometry(2.45, 0.1, 10, 40, Math.PI), archM, x, TIN_Y, 0); a.rotation.y = Math.PI / 2; a.castShadow = false; }
  const lehrL = label("TEROWONGAN PENDINGIN · ±100 m", { w: 1024, h: 96, font: `700 52px ${FONT}`, color: "#e6f6ff", size: 2.5 }); lehrL.position.set(14.3, 2.1, 2.7); scene.add(lehrL);

  // ---------- STATION 5: cutting bridge (x 22.5) and the moving sheets ----------
  const CX = LX1;
  for (const s of [-1, 1]) bx(0.22, 2.6, 0.22, std(0xb8c2d2, 0.25, 0.9), CX, 1.3, s * 2.3);
  bx(0.3, 0.26, 4.9, std(0xb8c2d2, 0.25, 0.9), CX, 2.55, 0);
  const head = new THREE.Group(); scene.add(head);
  bx(0.32, 0.4, 0.32, std(0x2a3140, 0.3, 0.6), 0, 0, 0, head);
  bx(0.05, 1.3, 0.05, std(0xd0d8e4, 0.2, 0.9), 0, -0.85, 0, head);
  const cutGlow = add(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false }), 0, -1.55, 0, head);
  const scoreM = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true, opacity: 0 });
  const score = bx(0.03, 0.01, 3.7, scoreM, CX + 0.02, TIN_Y + 0.06, 0); score.castShadow = false;
  const sheetM = glassM({ color: 0xe9fff8, thickness: 0.3, roughness: 0.03 });
  const stub = bx(1, 0.06, 3.7, sheetM, CX, TIN_Y + 0.03, 0);
  const sheets = [0, 1, 2].map(() => bx(2.6, 0.06, 3.7, sheetM, 0, TIN_Y + 0.03, 0));
  for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.09, 0.09, 4.2, 16), std(0x8a93a5, 0.3, 0.9), CX + 0.8 + i * 1.4, TIN_Y - 0.08, 0).rotation.x = Math.PI / 2;
  bx(7.5, 0.55, 4.6, std(0x1a1e27, 0.55, 0.3), CX + 3.8, 0.27, 0);
  const SP = 3.0, PER = 3.2; // sheet pitch, seconds per sheet
  // finished stack leaning on a rack
  for (let i = 0; i < 6; i++) { const s = bx(2.4, 3.0, 0.05, glassM({ color: 0xdcfff4, thickness: 0.15 }), 29.2, 1.6, -2.3 + i * 0.09); s.rotation.x = -0.12; s.castShadow = false; }
  bx(2.8, 0.2, 1.0, std(0x2b3240, 0.4, 0.6), 29.2, 0.1, -2.1);

  // ---------- s6 cutaway diorama: why tin (floats at x 27, in front of the line) ----------
  const SEC = new THREE.Group(); SEC.position.set(27.5, 2.15, 4.2); scene.add(SEC);
  const bpT = canvasTex(512, 320, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#2bb8a8"); gr.addColorStop(0.55, "#1a7f8f"); gr.addColorStop(1, "#1f4f8a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const rg = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7); rg.addColorStop(0, "rgba(255,255,255,.25)"); rg.addColorStop(1, "rgba(0,0,0,.35)"); g.fillStyle = rg; g.fillRect(0, 0, w, h); });
  const bpM = new THREE.MeshBasicMaterial({ map: bpT, color: 0xcccccc, fog: false });
  add(new THREE.PlaneGeometry(3.9, 2.45), bpM, 0, 0.1, -0.9, SEC);
  const secTin = bx(2.7, 0.62, 0.9, new THREE.MeshStandardMaterial({ color: 0xb4bfcf, metalness: 0.35, roughness: 0.38 }), 0, -0.35, 0, SEC);
  const secGlassM = glassM({ color: 0xfff0d6, thickness: 0.3, emissive: new THREE.Color(0xffa040), emissiveIntensity: 0.45, transmission: 0.8 });
  const secGlass = bx(2.7, 0.16, 0.9, secGlassM, 0, 0.05, 0, SEC);
  const lK = label("KACA", { w: 512, h: 120, font: `800 80px ${FONT}`, color: "#fff4e0", size: 1.0 }); lK.position.set(-0.55, 0.42, 0.5); SEC.add(lK);
  const lT = label("TIMAH CAIR", { w: 512, h: 120, font: `800 72px ${FONT}`, color: "#e9f3ff", size: 1.3 }); lT.position.set(0.0, -0.38, 0.47); SEC.add(lT);
  const arrM = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true, opacity: 0 });
  const arrows = [-0.9, 0, 0.9].map((x) => { const G = new THREE.Group(); G.position.set(x, -0.95, 0.55); SEC.add(G); add(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 10), arrM, 0, 0.18, 0, G); add(new THREE.ConeGeometry(0.09, 0.18, 16), arrM, 0, 0.42, 0, G); return G; });
  const sweepM = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0 });
  const sweepTop = bx(0.12, 0.012, 0.92, sweepM, 0, 0.14, 0, SEC), sweepBot = bx(0.12, 0.012, 0.92, sweepM, 0, -0.035, 0, SEC);
  const boilL = label("DIDIH > 2.000°C", { w: 768, h: 120, font: `800 70px ${MONO}`, color: "#ffd38a", size: 1.7 }); boilL.position.set(0.7, 0.62, 0.5); SEC.add(boilL);
  const secLight = new THREE.PointLight(0xffb070, 8, 5, 2); secLight.position.set(0, 0.9, 1.4); SEC.add(secLight);

  // ---------- STATION 6: the finished window pane (x 33) ----------
  const PX = 33, PY = 2.4;
  const paneM = glassM({ emissive: new THREE.Color(0x1d4a3e), emissiveIntensity: 0.8, color: 0xf2fbf7, thickness: 0.35, roughness: 0.02, attenuationColor: new THREE.Color(0xc4ebdc), attenuationDistance: 10 });
  const pane = bx(2.4, 3.4, 0.12, paneM, PX, PY, 0); pane.castShadow = false;
  const edgeGlow = bx(0.03, 3.4, 0.125, new THREE.MeshBasicMaterial({ color: 0x8ff0d2, toneMapped: false }), PX + 1.21, PY, 0);
  bx(1.4, 0.7, 0.7, std(0x2b3240, 0.35, 0.7), PX, 0.35, 0);
  const brM = new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false, transparent: true, opacity: 0 });
  const brk = [-1, 1].map((s) => bx(0.25, 0.03, 0.03, brM, PX + 1.36, PY + 0.55, s * 0.08));
  const mmL = label("≈ 7 mm", { w: 512, h: 128, font: `800 96px ${MONO}`, color: "#9ff6ff", size: 0.9 }); mmL.position.set(PX + 1.75, PY + 0.75, 0.2); mmL.rotation.y = 0.9; mmL.material.opacity = 0; scene.add(mmL);
  // 24h ring around the pane disc
  const ringPts = Array.from({ length: 121 }, (_, i) => { const q = Math.PI / 2 - (i / 120) * Math.PI * 2; return new THREE.Vector3(Math.cos(q) * 2.6, Math.sin(q) * 2.6, 0); });
  const ringGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ringPts), 120, 0.05, 8);
  const ring24 = add(ringGeo, new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false }), PX, PY, -1.2); ring24.castShadow = false;
  const ringIdx = ringGeo.index.count;
  // window frame for the s8 payoff
  const frameM = std(0xe8edf3, 0.3, 0.7);
  const frame = [[2.64, 0.12, 0, 1.76], [2.64, 0.12, 0, -1.76], [0.12, 3.64, -1.26, 0], [0.12, 3.64, 1.26, 0], [0.06, 3.4, 0, 0], [2.4, 0.06, 0, 0.35]].map(([w, h, x, y]) => bx(w, h, 0.18, frameM, PX + x, PY + y, 0.02));

  // ---------- inventors on a glass dais behind the bath (x -7, z -5.4) ----------
  const dais = add(new THREE.CylinderGeometry(1.9, 2.0, 0.24, 48), frostM({ color: 0xf6e8ff }), -7.2, 0.12, -5.4); dais.castShadow = false;
  const inv1 = person({ h: 2.1, cloth: 0x2c3c5e, trouser: 0x1a2133, skin: 0xd9a782, hair: 0x2b1d12 });
  const inv2 = person({ h: 2.05, cloth: 0x6b5a46, trouser: 0x2c2620, skin: 0xc99671, hair: 0x4a3a2c });
  inv1.G.position.set(-7.95, 0.24, -5.3); inv1.G.rotation.y = 0.35; scene.add(inv1.G);
  inv2.G.position.set(-6.4, 0.24, -5.4); inv2.G.rotation.y = -0.35; scene.add(inv2.G);
  pose(inv1, { reachR: 0.55, headY: -0.2 }); pose(inv2, { reachL: 0.45, headY: 0.25 });
  const sample = bx(0.55, 0.42, 0.02, glassM({ color: 0xfff1d8, emissive: new THREE.Color(0xffa64a), emissiveIntensity: 0.35 }), -7.18, 1.75, -5.05);
  const np = (txt, x) => { const l = label(txt, { w: 1024, h: 120, font: `700 58px ${FONT}`, color: "#ffffff", bg: "rgba(12,16,26,.62)", size: 2.0 }); l.position.set(x, 0.62, -4.0); scene.add(l); return l; };
  const n1 = np("ALASTAIR PILKINGTON", -8.25), n2 = np("KENNETH BICKERSTAFF", -6.1);
  const invL = new THREE.SpotLight(0xffffff, 60, 12, 0.5, 0.6, 2); invL.position.set(-5, 4.5, -1); invL.target.position.set(-7.2, 1.2, -5.4); scene.add(invL, invL.target);

  // ---------- camera: one continuous track, every key from K / AT ----------
  const cv = track([
    [0, 0.6, 3.7, 7.6, -5.2, 0.6, -0.8],
    [K.s1e, -0.4, 3.3, 6.8, -5.6, 0.6, -0.8],
    [K.s2 + 0.9, -3.6, 2.6, 3.4, -7.1, 1.25, -5.4],
    [A("s2:Kenneth"), -4.8, 2.5, 2.9, -7.1, 1.25, -5.4],
    [A("s2:diumumkan"), -9.2, 2.5, 3.0, -7.1, 1.3, -5.4],
    [K.s2e, -13, 3.2, 5.0, -12, 1.4, -2.5],
    [K.s3 + 0.8, -24.0, 3.6, 11.6, -26.6, 1.5, -1.3],
    [A("s3:batu"), -26.4, 3.5, 11.2, -28.0, 1.45, -1.3],
    [A("s3:pecahan"), -28.6, 3.4, 11.0, -29.4, 1.4, -1.3],
    [A("s3:tungku"), -11.5, 7.0, 11.0, -17, 0.9, 0],
    [A("s3:meleleh"), -12.4, 6.2, 9.4, -16.8, 0.8, 0],
    [K.s3e, -10.4, 2.8, 6.2, -14, 0.8, 0],
    [A("s4:dialirkan"), -8.6, 2.8, 6.4, -11.6, 0.7, 0],
    [A("s4:mengapung"), 3.0, 3.9, 7.2, -8.0, 0.6, -0.6],
    [A("s4:menyebar"), 3.8, 4.0, 6.8, -7.5, 0.6, -0.6],
    [A("s4:Selimut"), 3.4, 3.0, 7.4, -4.0, 1.0, 0],
    [K.s4e, 2.4, 3.6, 8.8, -0.6, 0.9, 0.4],
    [A("s5:Rol") + 0.4, 3.0, 3.4, 9.4, 0.4, 0.6, 1.0],
    [A("s5:pita"), 4.4, 3.6, 10.0, 2.4, 0.7, 0.6],
    [A("s5:Saat"), 8.2, 3.0, 8.0, 6.0, 0.8, 0],
    [A("s5:600"), 9.0, 2.9, 7.4, 6.8, 0.85, 0],
    [A("s5:terowongan"), 10.6, 3.4, 9.0, 13.5, 0.9, 0],
    [A("s5:100"), 15.6, 3.5, 9.2, 18.4, 0.9, 0],
    [A("s5:dipotong"), 21.0, 3.4, 9.0, 23.6, 0.9, 0],
    [K.s5e, 22.8, 3.4, 10.4, 24.6, 1.4, 1.0],
    [K.s6 + 0.7, 28.3, 3.5, 14.8, 27.5, 2.75, 4.2],
    [A("s6:Hasilnya"), 27.0, 3.3, 14.4, 27.5, 2.75, 4.2],
    [K.s6e, 28.4, 3.5, 14.6, 27.8, 2.75, 4.0],
    [K.s7 + 0.8, 31.6, 3.4, 11.2, 33.0, 2.9, 0],
    [A("s7:milimeter") - 0.4, 37.6, 3.6, 9.8, 33.2, 3.3, 0],
    [A("s7:milimeter") + 0.6, 37.8, 3.55, 9.4, 33.25, 3.32, 0],
    [A("s7:Kini") + 0.5, 31.4, 3.6, 12.2, 33.0, 2.9, -0.5],
    [K.s7e, 32.2, 3.5, 11.6, 33.0, 2.9, -0.5],
    [K.s8 + 0.7, 32.6, 3.3, 10.8, 33.0, 2.9, 0],
    [A("s8:Ikuti") + 0.3, 33.6, 3.6, 11.6, 33.0, 2.9, 0],
    [K.end, 42.0, 8.0, 18.0, 16, 1.6, 0],
    [K.dur, 43.0, 8.4, 18.6, 14, 1.4, 0],
  ]);

  const look = new THREE.Vector3(), tmp = new THREE.Color();
  return function draw(t) {
    const [px, py, pz, tx, ty, tz] = cv(t);
    cam.position.set(px, py, pz); look.set(tx, ty, tz); cam.lookAt(look);
    key.position.set(tx + 5, ty + 9, tz + 8); key.target.position.set(tx, ty, tz);
    rimC.position.set(tx - 4.5, ty + 2.2, tz - 3); rimC.intensity = 16 - 8 * (1 - ramp(t, K.s1e - 0.3, K.s2 + 0.6)); rimM.position.set(tx + 4.5, ty + 1.2, tz - 2.5);
    const pulse = 0.94 + 0.06 * Math.sin(t * 1.7);
    dBath.scale.setScalar(pulse); dPaneA.rotation.z = t * 0.05;

    // ---- hoppers light on their words, batch rides the conveyor into the furnace ----
    hop.forEach((h, i) => {
      const a = A(h.w), on = t > a - 0.1 && t < K.s4 ? eout((t - a + 0.1) / 0.4) : 0;
      h.ring.material.opacity = on * (0.6 + 0.4 * Math.sin(t * 4 + i));
      h.fillM.emissiveIntensity = 0.35 * on; h.G.position.y = 0.12 * on * Math.sin(Math.min(1, (t - a) / 0.5) * Math.PI);
    });
    batchSeed.forEach((s, i) => {
      const u = (s[0] + t * 0.07) % 1, x = -31 + u * 11.5;
      batch.pos[i * 3] = x; batch.pos[i * 3 + 1] = x > -20.2 ? 0.75 - (x + 20.2) * 2 : 0.75 + s[1] * 0.06; batch.pos[i * 3 + 2] = 0.6 + (s[1] - 0.5) * 0.7;
    });
    batch.commit();
    const melt = ramp(t, A("s3:tungku") - 0.4, A("s3:meleleh") + 0.6);
    poolM.emissiveIntensity = 0.55 + 0.5 * melt + 0.1 * Math.sin(t * 3.1);
    fLight.intensity = 12 + 10 * melt;
    lumps.forEach((l, i) => { const k = Math.max(0.001, 1 - clamp01(melt * 1.3 - i * 0.025)); l.scale.set(k, k, k); l.visible = k > 0.02; });
    flameSeed.forEach((s, i) => { const u = (s[0] + t * (0.25 + 0.2 * s[2])) % 1; flame.pos[i * 3] = FX + (s[1] - 0.5) * 5 + Math.sin(t * 2 + i) * 0.1; flame.pos[i * 3 + 1] = 0.9 + u * 1.8; flame.pos[i * 3 + 2] = (s[2] - 0.5) * 3; const k = 1 - u; flame.col.set([1 * k, 0.55 * k, 0.15 * k], i * 3); });
    flame.commit();

    // ---- canal, tweel lifts on "dialirkan" ----
    const lift = ramp(t, A("s4:dialirkan") - 0.3, A("s4:dialirkan") + 0.6);
    tweel.position.y = 1.15 + 0.35 * lift;
    canalM.emissiveIntensity = 0.7 + 0.3 * lift + 0.1 * Math.sin(t * 5);

    // ---- ribbon glow + flow over the tin ----
    ribM.emissiveIntensity = 1.0 + 0.08 * Math.sin(t * 2.3);
    sheens.forEach((m, i) => { m.position.x = BX0 + 0.8 + (((i / 3 + t * 0.045) % 1) * (BL - 1.6)); });
    flowSeed.forEach((s, i) => {
      const u = (s[0] + t * 0.055) % 1, x = BX0 + 0.1 + u * (BL - 0.2), w = wOf(x);
      flow.pos[i * 3] = x; flow.pos[i * 3 + 1] = TIN_Y + 0.05; flow.pos[i * 3 + 2] = s[1] * w * 0.92;
      const k = Math.max(0, 1 - u * 2.2); flow.col.set([k, 0.7 * k, 0.35 * k * k], i * 3);
    });
    flow.commit();
    const gasOn = t > A("s4:Selimut") - 0.4 && t < A("s5:Rol") + 0.6 ? ramp(t, A("s4:Selimut") - 0.4, A("s4:Selimut") + 0.6) * (1 - ramp(t, K.s5 - 0.1, A("s5:Rol") + 0.6)) : 0;
    canopyM.opacity = 0.32 * gasOn; canopy.visible = gasOn > 0.01;
    gasL.material.opacity = gasOn; gasL.visible = gasOn > 0.01;
    gasSeed.forEach((s, i) => { const u = (s[0] + t * 0.04) % 1; gas.pos[i * 3] = BX0 + u * BL; gas.pos[i * 3 + 1] = 1.0 + s[1] * 1.1 + Math.sin(t * 0.8 + i) * 0.08; gas.pos[i * 3 + 2] = (s[2] - 0.5) * 4.2; });
    gas.m.opacity = 0.8 * gasOn; gas.commit();
    const rolOn = t > A("s5:Rol") - 0.2 && t < A("s5:Saat") ? ramp(t, A("s5:Rol") - 0.2, A("s5:Rol") + 0.3) : 0;
    const rUp = ramp(t, K.s4e - 1.2, K.s4e); rollers.forEach((ro, i) => { ro.G.visible = rUp > 0.01 && t < K.s6; ro.G.position.y = TIN_Y + 0.1 + 1.6 * (1 - rUp); ro.wh.rotation.y = t * 2.2; ro.glow.material.opacity = rolOn * (0.7 + 0.3 * Math.sin(t * 6 + i)); });
    const s600 = t > A("s5:600") - 0.3 && t < A("s5:terowongan") + 0.5 ? back(clamp01((t - A("s5:600") + 0.3) / 0.45)) : 0;
    t600.scale.setScalar(Math.max(0.001, s600)); t600.visible = s600 > 0.01; t600.lookAt(cam.position);
    const hk = 1 - ramp(t, K.s1e - 0.3, K.s2 + 0.6); const s4w = ramp(t, K.s4 + 1, A("s4:mengapung")) * (1 - ramp(t, A("s4:Selimut"), K.s4e)); tinM.roughness = 0.16 + 0.2 * Math.max(hk, 0.55 * s4w); tinM.emissiveIntensity = 0.55 - 0.2 * hk - 0.3 * s4w; tinM.color.setHex(0xd4dbe6).multiplyScalar(1 - 0.6 * s4w); ribM.opacity = 0.62 + 0.2 * s4w; ribM.emissiveIntensity = 1.0 + 1.4 * hk; spoutL.intensity = (10 + 14 * hk) * (1 - 0.85 * s4w); warm.forEach((l, i) => { l.intensity = (5 + 1 * Math.sin(t * 1.9 + i * 1.3)) * (i >= 2 ? 1 - 0.9 * hk : 1 - 0.8 * s4w); });

    // ---- cutting: stub grows from the bridge, the cutter crosses, sheets ride on ----
    const u = (t / PER) % 1;
    stub.scale.x = Math.max(0.001, SP * 0.86 * u); stub.position.x = CX + 0.05 + (SP * 0.86 * u) / 2;
    sheets.forEach((s, k) => { s.position.x = CX + 0.05 + SP * 0.43 + (k + u) * SP + 0.12; s.visible = s.position.x < 30.8; });
    const cu = clamp01((u - 0.82) / 0.16);
    head.position.set(CX + 0.05, 2.3, -1.85 + 3.7 * cu);
    scoreM.opacity = u > 0.82 ? 0.9 * Math.sin(cu * Math.PI) : 0; cutGlow.material.color.setHex(u > 0.82 ? 0xffffff : CYAN);

    // ---- s6 cutaway ----
    const secIn = t > K.s6 - 0.6 && t < K.s7 + 0.6 ? back(clamp01((t - K.s6 + 0.5) / 0.7)) * (1 - ramp(t, K.s7 - 0.2, K.s7 + 0.5)) : 0;
    SEC.visible = secIn > 0.01; SEC.scale.setScalar(Math.max(0.001, secIn)); SEC.rotation.y = -0.18 + 0.12 * Math.sin(t * 0.4);
    const ar = ramp(t, A("s6:rapat") - 0.2, A("s6:rapat") + 0.5);
    arrM.opacity = ar; arrows.forEach((a, i) => { a.position.y = -0.95 + 0.06 * Math.sin(t * 3 + i * 1.4) * ar; });
    secGlass.position.y = 0.05 + 0.04 * Math.sin(t * 1.6) * (1 - ramp(t, A("s6:Pendinginan"), A("s6:Pendinginan") + 1));
    boilL.material.opacity = ramp(t, A("s6:mendidih") - 0.2, A("s6:mendidih") + 0.4);
    const sw = clamp01((t - A("s6:Hasilnya")) / 1.6);
    sweepM.opacity = t > A("s6:Hasilnya") && sw < 1 ? Math.sin(sw * Math.PI) : 0;
    sweepTop.position.x = sweepBot.position.x = -1.3 + 2.6 * sw;
    const cool = ramp(t, A("s6:Pendinginan"), A("s6:Pendinginan") + 1.6);
    secGlassM.emissiveIntensity = 0.45 * (1 - cool);
    secLight.intensity = 8 * secIn;

    // ---- pane: thickness bracket, 24 h ring, frame ----
    const mm = t > A("s7:milimeter") - 0.6 && t < A("s7:Kini") + 0.3 ? ramp(t, A("s7:milimeter") - 0.6, A("s7:milimeter") - 0.1) * (1 - ramp(t, A("s7:Kini"), A("s7:Kini") + 0.3)) : 0;
    brM.opacity = mm; mmL.material.opacity = mm; mmL.visible = mm > 0.01;
    brk.forEach((b, i) => { b.position.z = (i ? 1 : -1) * (0.065 + 0.04 * (1 - mm)); });
    edgeGlow.material.color.setRGB(0.3 + 0.3 * mm, 0.6 + 0.2 * mm, 0.52 + 0.2 * mm);
    const h24 = t > A("s7:24") - 0.5 ? ramp(t, A("s7:24") - 0.4, A("s7:24") + 1.4) : 0;
    ring24.geometry.setDrawRange(0, Math.floor((ringIdx * h24) / 6) * 6); ring24.visible = h24 > 0.005;
    const fr = ramp(t, A("s8:jendela") - 0.3, A("s8:jendela") + 0.8);
    frame.forEach((f, i) => { const k = clamp01(fr * 1.6 - i * 0.12); const hor = i < 2 || i === 5; f.scale.set(hor ? Math.max(0.001, k) : 1, hor ? 1 : Math.max(0.001, k), 1); f.visible = k > 0.01; });
    pane.rotation.y = 0.05 * Math.sin(t * 0.35);

    // ---- inventors: name plates face the camera, sample glints ----
    const invOn = t < K.s4 - 0.2; for (const o of [dais, inv1.G, inv2.G, sample, n1, n2, dInv]) o.visible = invOn; invL.visible = invOn;
    n1.lookAt(cam.position); n2.lookAt(cam.position);
    const ins = ramp(t, A("s2:Alastair") - 0.4, A("s2:Alastair") + 0.3), ins2 = ramp(t, A("s2:Kenneth") - 0.4, A("s2:Kenneth") + 0.3);
    n1.material.opacity = 0.25 + 0.75 * ins; n2.material.opacity = 0.25 + 0.75 * ins2;
    inv1.head.rotation.y = -0.2 + 0.15 * Math.sin(t * 0.6); inv2.head.rotation.y = 0.25 - 0.12 * Math.sin(t * 0.5 + 1);
    sample.rotation.y = 0.3 * Math.sin(t * 0.7);
    dInv.material.opacity = 0.6 + 0.3 * ramp(t, K.s2 - 0.3, K.s2 + 0.6);
    invL.intensity = 30 + 50 * ramp(t, K.s2 - 0.5, K.s2 + 0.5);

    lehrL.position.x = Math.min(19.5, Math.max(9.5, px + (tx - px) * 0.7)); lehrL.lookAt(cam.position);
    rimM.color.setHex(t > K.s7 - 0.8 ? 0xbfeee6 : MAG);
    const hook = 1 - ramp(t, K.s1e - 0.3, K.s2 + 0.6);
    const s4b = ramp(t, K.s4 + 1, A("s4:mengapung")) * (1 - ramp(t, A("s4:Selimut"), K.s4e));
    bp.strength = 0.5 - 0.22 * hook - 0.2 * s4b; r.toneMappingExposure = 1.0 - 0.12 * hook - 0.12 * s4b;
    comp.render();
  };
}
