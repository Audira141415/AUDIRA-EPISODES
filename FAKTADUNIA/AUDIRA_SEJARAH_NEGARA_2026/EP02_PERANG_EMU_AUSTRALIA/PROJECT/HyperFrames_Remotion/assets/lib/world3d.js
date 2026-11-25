// PERANG EMU: a warm clay tabletop diorama of the Western Australian wheatbelt. Four stations along one table
// (farm, army camp, battlefield, new fence). Every toy (emus, soldiers, truck, rabbits) moves on a 12 fps clock
// like stop-motion; the camera and the wind stay smooth. Deterministic: everything is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, std, box, cyl, stage, pts, back } from "./lib3d.js";

const FARM = 0, CAMP = 58, BAT = 110, FEN = 166;
const SKY = 0x8fd3f0, OCHRE = 0xc8792e, WHEAT = 0xe8c15a, EMU = 0x5b4636, PAPER = "#EFE6D2", INK = "#2A2118";
const NB = 180, NF = 560, NE = 40, N = NB + NF + NE;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: SKY, fog: 0.0042, exp: 1.02, bloom: [0.22, 0.5, 0.93], fov: 38 });
  const rnd = mulberry(1932);
  const A = (k) => AT[k];

  // light: big warm sun from the back right, cool sky fill
  const hemi = new THREE.HemisphereLight(0xd8f0ff, 0xb5763c, 1.55);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe0b0, 3.1);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 220 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xa8d8ff, 0.7);
  fill.position.set(-40, 30, 60); scene.add(fill);

  // clay: thumb-smudge bump on every toy
  const bumpT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); const q = mulberry(7); for (let i = 0; i < 900; i++) { const v = 90 + q() * 80; g.fillStyle = `rgba(${v},${v},${v},.4)`; g.beginPath(); g.ellipse(q() * w, q() * h, 2 + q() * 10, 1 + q() * 4, q() * 3, 0, 7); g.fill(); } }, [2, 2]);
  bumpT.colorSpace = THREE.NoColorSpace;
  const clay = (c, rough = 0.86) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0, bumpMap: bumpT, bumpScale: 1.4 });
  const lump = (geo, amt, seed) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + amt * Math.sin(x * 7 + seed) * Math.sin(y * 6 + seed * 0.5) * Math.sin(z * 8 + 1); p.setXYZ(i, x * n, y * n, z * n); } geo.computeVertexNormals(); return geo; };

  // sky dome, sun and cotton-clay clouds, all following the lens so the backdrop never ends
  const skyT = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5fb8e6"); gr.addColorStop(0.42, "#8fd3f0"); gr.addColorStop(0.5, "#f6e2b8"); gr.addColorStop(1, "#e9b878"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 16), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false }));
  scene.add(dome);
  const sky = new THREE.Group(); scene.add(sky);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.86, 0.55).multiplyScalar(2.2), fog: false }));
  sun.position.set(70, 92, -250); sky.add(sun);
  const halo = new THREE.Mesh(new THREE.CircleGeometry(40, 48), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.28, fog: false, depthWrite: false }));
  halo.position.set(70, 92, -262); sky.add(halo);
  const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xfff3e0, emissiveIntensity: 0.35, fog: false });
  const clouds = [];
  for (let c = 0; c < 9; c++) {
    const G = new THREE.Group();
    for (let k = 0; k < 6; k++) { const s = 4 + rnd() * 6; const m = new THREE.Mesh(lump(new THREE.IcosahedronGeometry(1, 2), 0.06, k), cloudM); m.scale.set(s * 1.4, s * 0.8, s); m.position.set((k - 2.5) * 5 + rnd() * 3, rnd() * 3, rnd() * 4); G.add(m); }
    G.position.set(-160 + c * 46 + rnd() * 20, 55 + rnd() * 26, -170 - rnd() * 40); sky.add(G); clouds.push(G);
  }

  // the table: an ochre clay slab on a walnut table, distant clay hills painted on the back
  const groundT = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#c8792e"; g.fillRect(0, 0, w, h); const q = mulberry(3); for (let i = 0; i < 2600; i++) { const v = q(); g.fillStyle = v < 0.5 ? `rgba(150,82,30,${0.12 + q() * 0.2})` : `rgba(232,170,100,${0.1 + q() * 0.2})`; g.beginPath(); g.ellipse(q() * w, q() * h, 4 + q() * 30, 2 + q() * 9, q() * 3, 0, 7); g.fill(); } for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(90,50,20,.35)"; g.fillRect(q() * w, q() * h, 3, 3); } }, [10, 4]);
  const groundM = new THREE.MeshStandardMaterial({ map: groundT, roughness: 0.95, bumpMap: bumpT, bumpScale: 2 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(360, 130), groundM);
  ground.rotation.x = -Math.PI / 2; ground.position.set(85, 0, -12); ground.receiveShadow = true; scene.add(ground);
  box(360, 5, 130, clay(0x8a4f22), 85, -2.52, -12, scene).castShadow = false;
  const table = new THREE.Mesh(new THREE.PlaneGeometry(900, 500), std(0x5e3b22, 0.6, 0));
  table.rotation.x = -Math.PI / 2; table.position.set(85, -5.1, 0); scene.add(table);
  const hillM = clay(0xb06a30, 0.95), hillM2 = clay(0x8f8a48, 0.95);
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(lump(new THREE.IcosahedronGeometry(1, 3), 0.05, i), i % 3 ? hillM : hillM2); const s = 10 + rnd() * 14; m.scale.set(s * 1.8, s * (0.35 + rnd() * 0.25), s); m.position.set(-80 + i * 14 + rnd() * 8, -1, -88 - rnd() * 18); m.receiveShadow = true; scene.add(m); }

  // shared helpers
  const dummy = new THREE.Object3D();
  const inst = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); return m; };
  const beam = (a, b, rad, mat, parent) => { const d = new THREE.Vector3().subVectors(b, a); const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, d.length(), 6), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; parent.add(m); return m; };

  // canvas labels drawn again once the web fonts are ready
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const rr = (g, x, y, w, h, rad) => { g.beginPath(); g.moveTo(x + rad, y); g.arcTo(x + w, y, x + w, y + h, rad); g.arcTo(x + w, y + h, x, y + h, rad); g.arcTo(x, y + h, x, y, rad); g.arcTo(x, y, x + w, y, rad); g.closePath(); };

  // name tag above a toy: paper card with a tape strip, always facing the lens
  const tags = [];
  const nameTag = (title, sub, parent, y, at) => {
    const tx = label(640, 220, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(42,33,24,.25)"; rr(g, 14, 22, w - 24, h - 30, 34); g.fill(); g.fillStyle = PAPER; rr(g, 8, 12, w - 24, h - 30, 34); g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.fillStyle = "rgba(232,193,90,.85)"; g.save(); g.translate(w / 2, 16); g.rotate(-0.05); g.fillRect(-70, -14, 140, 30); g.restore(); g.fillStyle = INK; g.textAlign = "center"; g.font = "700 74px Fredoka, sans-serif"; g.fillText(title, w / 2 - 8, 112); g.fillStyle = "#C8792E"; g.font = "900 34px Nunito, sans-serif"; g.fillText(sub, w / 2 - 8, 162); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.0), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, fog: false }));
    m.position.y = y; m.renderOrder = 5; parent.add(m); tags.push({ m, at }); return m;
  };

  // toy figure on a round base. kind: soldier (slouch hat), suit (minister), farmer (straw hat)
  const skinM = clay(0xe2b48c), blackM = clay(0x15110e, 0.4), baseM = clay(0x4f6b35);
  const toy = (kind, tunic, pants) => {
    const G = new THREE.Group(), tM = clay(tunic), pM = clay(pants);
    cyl(0.44, 0.48, 0.13, 22, baseM, 0, 0.065, 0, G);
    box(0.17, 0.64, 0.22, pM, -0.11, 0.45, 0, G); box(0.17, 0.64, 0.22, pM, 0.11, 0.45, 0, G);
    box(0.19, 0.08, 0.3, blackM, -0.11, 0.17, 0.04, G); box(0.19, 0.08, 0.3, blackM, 0.11, 0.17, 0.04, G);
    cyl(0.21, 0.25, 0.66, 16, tM, 0, 1.08, 0, G);
    cyl(0.255, 0.255, 0.07, 16, clay(kind === "suit" ? 0x22201f : 0x5a3d22), 0, 0.82, 0, G);
    const arm = (s) => { const p = new THREE.Group(); p.position.set(s * 0.3, 1.33, 0); G.add(p); cyl(0.075, 0.07, 0.58, 10, tM, 0, -0.28, 0, p); const hnd = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), skinM); hnd.position.y = -0.6; p.add(hnd); return p; };
    const armL = arm(-1), armR = arm(1);
    const head = new THREE.Group(); head.position.y = 1.58; G.add(head);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), skinM); hd.castShadow = true; head.add(hd);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), skinM); nose.position.set(0, -0.01, 0.2); head.add(nose);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), blackM); e.position.set(s * 0.075, 0.04, 0.18); head.add(e); }
    if (kind === "soldier") { const hm = clay(0x7a6a44); cyl(0.38, 0.38, 0.04, 22, hm, 0, 0.13, 0, head).rotation.z = 0.08; cyl(0.17, 0.2, 0.2, 16, hm, 0, 0.24, 0, head); cyl(0.205, 0.205, 0.05, 16, clay(0x3d2f1d), 0, 0.17, 0, head); const up = box(0.05, 0.22, 0.34, hm, -0.36, 0.22, 0, head); up.rotation.z = 0.25; }
    if (kind === "farmer") { const hm = clay(0xd8b56a); cyl(0.44, 0.44, 0.04, 22, hm, 0, 0.14, 0, head); cyl(0.17, 0.19, 0.2, 16, hm, 0, 0.25, 0, head); }
    if (kind === "suit") { const hair = new THREE.Mesh(new THREE.SphereGeometry(0.205, 18, 10, 0, 6.3, 0, 1.3), clay(0xc9c4bb)); head.add(hair); const tie = box(0.06, 0.3, 0.02, clay(0x8a2a1c), 0, 1.22, 0.215, G); tie.castShadow = false; for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 12), blackM); e.position.set(s * 0.075, 0.04, 0.19); head.add(e); } }
    return { G, armL, armR, head };
  };

  // Lewis gun: fat cooling shroud, flat pan magazine on top, bipod. Points along +z.
  const gunM = clay(0x2f3335, 0.55), woodM = clay(0x6b4423);
  const lewis = () => {
    const G = new THREE.Group();
    const sh = cyl(0.13, 0.13, 1.2, 14, gunM, 0, 0.42, 0.25, G); sh.rotation.x = Math.PI / 2;
    const bl = cyl(0.04, 0.04, 0.4, 8, gunM, 0, 0.42, 1.0, G); bl.rotation.x = Math.PI / 2;
    cyl(0.3, 0.3, 0.07, 22, clay(0x3e4446, 0.5), 0, 0.6, -0.15, G);
    box(0.12, 0.2, 0.62, woodM, 0, 0.36, -0.62, G);
    for (const s of [-1, 1]) { const l = cyl(0.025, 0.025, 0.55, 6, gunM, s * 0.16, 0.2, 0.62, G); l.rotation.z = s * 0.35; }
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.75, 0.3).multiplyScalar(4) }));
    flash.position.set(0, 0.42, 1.3); flash.scale.set(0.6, 0.6, 1.2); G.add(flash);
    const L = new THREE.PointLight(0xffb050, 0, 9, 1.6); L.position.set(0, 0.6, 1.4); G.add(L);
    return { G, flash, L };
  };

  // ===== FARM =====
  const farm = new THREE.Group(); scene.add(farm);
  const wallM = clay(0xefe2c4), roofM = clay(0xa5482a), trimM = clay(0x5a6e4a);
  const house = new THREE.Group(); house.position.set(-10, 0, -13); house.rotation.y = 0.25; farm.add(house);
  box(6, 2.6, 4, wallM, 0, 1.3, 0, house);
  const roofG = new THREE.CylinderGeometry(2.7, 2.7, 6.8, 3); roofG.rotateZ(Math.PI / 2); roofG.rotateX(-Math.PI / 2);
  const roof = new THREE.Mesh(roofG, roofM); roof.scale.set(1, 0.55, 0.95); roof.position.set(0, 3.2, 0); roof.castShadow = true; house.add(roof);
  box(6.6, 0.12, 1.8, roofM, 0, 2.25, 2.9, house).rotation.x = 0.18;
  for (const x of [-3, -1, 1, 3]) cyl(0.07, 0.07, 2.2, 6, trimM, x, 1.1, 3.6, house);
  box(0.9, 1.6, 0.1, clay(0x6b3a22), 0, 0.8, 2.03, house);
  for (const x of [-1.9, 1.9]) box(1, 0.8, 0.1, clay(0x3c5f73, 0.3), x, 1.5, 2.03, house);
  box(0.5, 1.4, 0.5, clay(0x9a5a3a), 1.8, 4.1, -0.6, house);
  const tank = cyl(0.95, 0.95, 1.7, 18, clay(0x8aa39a, 0.5), -4.4, 2.45, 1, house); cyl(0.6, 0.6, 1.6, 8, clay(0x6b4423), -4.4, 0.8, 1, house); void tank;
  // windmill
  const mill = new THREE.Group(); mill.position.set(-19, 0, -6); farm.add(mill);
  const steelM = clay(0x8e8a80, 0.6);
  const top = new THREE.Vector3(0, 8.2, 0);
  for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [1.2, 1.2], [-1.2, 1.2]]) beam(new THREE.Vector3(x, 0, z), top, 0.07, steelM, mill);
  for (const y of [2.5, 5]) { const s = 1.2 * (1 - y / 8.2); for (const [a, b] of [[[-s, -s], [s, -s]], [[s, -s], [s, s]], [[s, s], [-s, s]], [[-s, s], [-s, -s]]]) beam(new THREE.Vector3(a[0], y, a[1]), new THREE.Vector3(b[0], y, b[1]), 0.04, steelM, mill); }
  const fan = new THREE.Group(); fan.position.set(0, 8.4, 0.4); mill.add(fan);
  const bladeM = clay(0xd9d2c0, 0.5);
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.7, 0.04), bladeM); const a = (i / 14) * Math.PI * 2; b.position.set(Math.sin(a) * 1.1, Math.cos(a) * 1.1, 0); b.rotation.z = -a; b.rotation.y = 0.3; b.castShadow = true; fan.add(b); }
  cyl(0.2, 0.2, 0.3, 10, steelM, 0, 0, 0, fan).rotation.x = Math.PI / 2;
  const vane = box(0.06, 0.9, 1.8, clay(0xc4502e), 0, 8.4, -1.4, mill); void vane;
  // dam
  const dam = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshStandardMaterial({ color: 0x6fb7c4, roughness: 0.15, metalness: 0.1 }));
  dam.rotation.x = -Math.PI / 2; dam.position.set(17, 0.05, -14); dam.scale.set(1.3, 1, 1); farm.add(dam);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(5, 0.45, 8, 40), clay(0xa8602a)); rim.rotation.x = Math.PI / 2; rim.scale.set(1.3, 1, 1); rim.position.set(17, 0.05, -14); farm.add(rim);
  // price sign: arrow flips down when the wheat price falls
  const sign = new THREE.Group(); sign.position.set(-2.5, 0, 1.5); sign.rotation.y = 0.3; farm.add(sign);
  cyl(0.08, 0.08, 2.4, 6, woodM, 0, 1.2, 0, sign);
  const signT = label(512, 256, (g, w, h) => { g.fillStyle = PAPER; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); g.fillStyle = INK; g.textAlign = "center"; g.font = "700 70px Fredoka, sans-serif"; g.fillText("HARGA", w / 2, 108); g.fillText("GANDUM", w / 2, 190); });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.08), [woodM, woodM, woodM, woodM, new THREE.MeshStandardMaterial({ map: signT, roughness: 0.8 }), woodM]); board.position.y = 2.6; board.castShadow = true; sign.add(board);
  const arrow = new THREE.Group(); arrow.position.set(1.5, 2.6, 0.1); sign.add(arrow);
  const redM = clay(0xc2381e);
  box(0.22, 0.9, 0.12, redM, 0, 0.3, 0, arrow); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 12), redM); tip.position.y = 0.9; tip.castShadow = true; arrow.add(tip);

  // fences: one back fence at the farm (gets broken), one new fence at the end (gets built)
  const postM = clay(0x7a5a38), wireM = clay(0x9a9a92, 0.4);
  const farmPosts = []; for (let x = -28; x <= 40; x += 2) farmPosts.push(x);
  const fpI = inst(new THREE.CylinderGeometry(0.09, 0.11, 1.5, 6), postM, farmPosts.length);
  const fwI = inst(new THREE.BoxGeometry(2, 0.035, 0.035), wireM, (farmPosts.length - 1) * 3, false);
  const FZ = -24;
  const newPosts = 26;
  const npI = inst(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 6), clay(0x9a7448), newPosts);
  const nwI = inst(new THREE.BoxGeometry(2, 0.04, 0.04), wireM, (newPosts - 1) * 3, false);

  // wheat: instanced stalks + heads, two fields
  const wheat = [];
  for (let x = -16; x <= 24; x += 0.42) for (let z = -9; z <= 14; z += 0.95) wheat.push([x + (rnd() - 0.5) * 0.3, z + (rnd() - 0.5) * 0.3, 0.8 + rnd() * 0.4, rnd(), rnd(), 0]);
  for (let x = FEN - 26; x <= FEN + 26; x += 0.48) for (let z = 3; z <= 12; z += 0.95) wheat.push([x + (rnd() - 0.5) * 0.3, z + (rnd() - 0.5) * 0.3, 0.8 + rnd() * 0.4, rnd(), rnd(), 1]);
  const stalkG = new THREE.CylinderGeometry(0.022, 0.03, 1, 5); stalkG.translate(0, 0.5, 0);
  const headG = new THREE.CapsuleGeometry(0.065, 0.22, 3, 6); headG.translate(0, 1.08, 0);
  const stalkI = inst(stalkG, clay(0xc99a3a, 0.8), wheat.length), headI = inst(headG, clay(WHEAT, 0.7), wheat.length);
  const eatT = A("s3:dimakan");
  // furrow under the farm field
  const furT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#a9602a"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(70,36,12,.35)"; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 6); }, [8, 6]);
  const fur = new THREE.Mesh(new THREE.PlaneGeometry(42, 25), new THREE.MeshStandardMaterial({ map: furT, roughness: 1 })); fur.rotation.x = -Math.PI / 2; fur.position.set(4, 0.02, 2.5); fur.receiveShadow = true; scene.add(fur);
  const fur2 = fur.clone(); fur2.scale.set(1.3, 0.45, 1); fur2.position.set(FEN, 0.02, 7.5); scene.add(fur2);

  // bushes, rocks and dead trees everywhere for depth; a few right in front of the lens paths
  const bushI = inst(lump(new THREE.IcosahedronGeometry(1, 2), 0.12, 4), clay(0x7d8a45), 240);
  for (let i = 0; i < 240; i++) { let x = -40 + rnd() * 250, z = -50 + rnd() * 90; if (x > -18 && x < 26 && z > -10 && z < 16) z += 30; if (x > FEN - 28 && x < FEN + 28 && z > -2 && z < 14) z += 20; if ((x > BAT - 22 && x < BAT + 10 && z > -12 && z < 26) || (x > CAMP - 10 && x < CAMP + 12 && z > -3 && z < 20) || (x > 38 && x < 52 && z > 0 && z < 22)) z -= 40; const s = 0.4 + rnd() * 1.1; dummy.position.set(x, s * 0.4, z); dummy.scale.set(s * 1.2, s * 0.8, s); dummy.rotation.set(0, rnd() * 6, 0); dummy.updateMatrix(); bushI.setMatrixAt(i, dummy.matrix); }
  const rockI = inst(lump(new THREE.DodecahedronGeometry(1, 0), 0.1, 9), clay(0x9c6a45), 120);
  for (let i = 0; i < 120; i++) { const s = 0.2 + rnd() * 0.6; dummy.position.set(-40 + rnd() * 250, s * 0.3, -50 + rnd() * 95); dummy.scale.set(s, s * 0.7, s); dummy.rotation.set(rnd(), rnd() * 6, rnd()); dummy.updateMatrix(); rockI.setMatrixAt(i, dummy.matrix); }
  const treeM = clay(0x8c8378);
  for (const [x, z, s] of [[BAT + 12, -14, 1.2], [BAT - 18, -20, 1], [BAT + 26, -4, 0.9], [CAMP + 14, -12, 1], [FARM + 30, -30, 1.1], [FEN + 24, -14, 1], [FEN - 22, -16, 0.9], [BAT - 2, -30, 1.3]]) {
    const T = new THREE.Group(); T.position.set(x, 0, z); T.scale.setScalar(s); scene.add(T);
    beam(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 4, 0), 0.22, treeM, T); beam(new THREE.Vector3(0.2, 2.6, 0), new THREE.Vector3(-1.4, 4.4, 0.3), 0.12, treeM, T); beam(new THREE.Vector3(0.3, 3.4, 0), new THREE.Vector3(1.6, 5, -0.2), 0.1, treeM, T);
    for (const [a, b, c] of [[-1.4, 4.6, 0.3], [1.6, 5.2, -0.2], [0.3, 4.4, 0]]) { const f = new THREE.Mesh(lump(new THREE.IcosahedronGeometry(1, 2), 0.1, a), clay(0x6f8a4a)); f.position.set(a, b, c); f.scale.set(1.3, 0.7, 1.1); f.castShadow = true; T.add(f); }
  }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(90, 2.6), new THREE.MeshStandardMaterial({ color: 0xdea064, roughness: 1 })); road.rotation.x = -Math.PI / 2; road.position.set(BAT + 10, 0.03, 9.4); road.receiveShadow = true; scene.add(road);

  // ===== PEARCE: a separate wooden plinth (the office far away) =====
  const off = new THREE.Group(); off.position.set(46, 0, 5); scene.add(off);
  box(5.4, 1.2, 3.6, clay(0x8a5a35), 0, 0.6, 0, off);
  box(5.6, 0.1, 3.8, clay(0x6b3f22), 0, 1.22, 0, off);
  const desk = box(2, 0.75, 0.95, clay(0x6b3f22), 0, 1.65, 0.6, off); void desk;
  box(0.4, 0.12, 0.25, blackM, -0.6, 2.08, 0.5, off); cyl(0.04, 0.04, 0.3, 6, blackM, -0.6, 2.25, 0.5, off);
  const paper = box(0.55, 0.02, 0.4, clay(0xf6efdf), 0.3, 2.04, 0.75, off); void paper;
  const okMark = box(0.34, 0.025, 0.14, clay(0xc2381e), 0.3, 2.055, 0.75, off);
  const stampG = new THREE.Group(); stampG.position.set(0.3, 2.06, 0.75); off.add(stampG);
  box(0.36, 0.1, 0.18, clay(0x5a3d22), 0, 0.05, 0, stampG); cyl(0.05, 0.06, 0.3, 8, woodM, 0, 0.25, 0, stampG); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), clay(0xc2381e)); knob.position.y = 0.45; stampG.add(knob);
  const pearce = toy("suit", 0x3b3f46, 0x2e3137); pearce.G.position.set(0, 1.27, -0.35); off.add(pearce.G);
  nameTag("GEORGE PEARCE", "MENTERI PERTAHANAN", pearce.G, 2.55, A("s4:George"));
  const flagOff = new THREE.Group(); flagOff.position.set(2.1, 1.27, -1.1); off.add(flagOff);
  cyl(0.03, 0.03, 1.6, 6, steelM, 0, 0.8, 0, flagOff);

  // ===== CAMP =====
  const camp = new THREE.Group(); scene.add(camp);
  const tentG = new THREE.ConeGeometry(2.6, 2.6, 4); const tent = new THREE.Mesh(tentG, clay(0xb9a77a)); tent.position.set(CAMP - 5, 1.3, -5); tent.rotation.y = 0.78; tent.castShadow = true; camp.add(tent);
  const pole = cyl(0.05, 0.05, 4.2, 6, steelM, CAMP - 2.5, 2.1, 4, camp); void pole;
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75, 8, 2), new THREE.MeshStandardMaterial({ color: 0xe0782e, side: THREE.DoubleSide, roughness: 0.8 }));
  flag.position.set(CAMP - 1.83, 3.8, 4); camp.add(flag); const flagBase = flag.geometry.attributes.position.array.slice();
  // ammo: 10 crates of 1.000 in a pyramid 4-3-2-1
  const crateT = label(256, 160, (g, w, h) => { g.fillStyle = "#5c6b33"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3a4420"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = "#efe6d2"; g.textAlign = "center"; g.font = "700 46px Fredoka, sans-serif"; g.fillText("PELURU", w / 2, 70); g.font = "900 40px Nunito, sans-serif"; g.fillText("1.000", w / 2, 122); });
  const crateM = clay(0x5c6b33), crateFace = new THREE.MeshStandardMaterial({ map: crateT, roughness: 0.85 });
  const crates = [];
  let ci = 0;
  for (let row = 0; row < 4; row++) for (let k = 0; k < 4 - row; k++) {
    const C = new THREE.Group(); C.position.set(CAMP + 4.6 + (k - (3 - row) / 2) * 1.06, row * 0.62, 1); camp.add(C);
    const b = new THREE.Mesh(new THREE.BoxGeometry(1, 0.56, 0.7), [crateM, crateM, crateM, crateM, crateFace, crateM]); b.position.y = 0.28; b.castShadow = b.receiveShadow = true; C.add(b);
    const lidP = new THREE.Group(); lidP.position.set(0, 0.57, -0.35); C.add(lidP); box(1.04, 0.07, 0.74, clay(0x6b7a3c), 0, 0, 0.37, lidP);
    const brass = box(0.86, 0.06, 0.56, clay(0xd4a440, 0.4), 0, 0.5, 0, C); brass.visible = false;
    crates.push({ C, lidP, brass, i: ci++ });
  }
  const quest = new THREE.Group(); quest.position.set(CAMP + 3.6, 1.3, 2.9); camp.add(quest);
  const qM = clay(0xff8a2a);
  const qa = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.16, 12, 28, Math.PI * 1.5), qM); qa.rotation.z = -Math.PI * 0.5; qa.position.y = 0.55; qa.castShadow = true; quest.add(qa);
  cyl(0.16, 0.16, 0.45, 12, qM, 0, -0.1, 0, quest); const qd = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), qM); qd.position.y = -0.62; quest.add(qd);

  // soldiers, guns, truck (moved between camp and battlefield on scene cuts)
  const mer = toy("soldier", 0x8a7a4a, 0x6e6040); scene.add(mer.G);
  nameTag("MAYOR MEREDITH", "ARTILERI AUSTRALIA", mer.G, 2.6, A("s4:Meredith"));
  const sgt = toy("soldier", 0x857548, 0x6e6040); scene.add(sgt.G);
  const gnr = toy("soldier", 0x857548, 0x6e6040); scene.add(gnr.G);
  const gun1 = lewis(); scene.add(gun1.G);
  const gun2 = lewis();
  const truck = new THREE.Group(); scene.add(truck);
  const tBody = new THREE.Group(); truck.add(tBody);
  const tGreen = clay(0x4a6040), tDark = clay(0x2a2b28, 0.6);
  box(1.6, 1.1, 1.3, tGreen, 0, 1.25, 0.6, tBody); box(1.4, 0.75, 1.3, tGreen, 0, 1.05, 1.85, tBody); box(1.42, 0.5, 0.06, tDark, 0, 1.05, 2.52, tBody);
  box(1.3, 0.5, 0.06, clay(0x8ab0c0, 0.2), 0, 1.6, 1.26, tBody);
  box(1.8, 0.16, 2.8, clay(0x7a5a38), 0, 0.82, -1.2, tBody);
  for (const s of [-1, 1]) box(0.08, 0.4, 2.8, clay(0x7a5a38), s * 0.88, 1.08, -1.2, tBody);
  for (const s of [-1, 1]) { const mg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.36, 14, 1, true, 0, Math.PI), tGreen); mg.rotation.z = Math.PI / 2; mg.rotation.y = Math.PI / 2; mg.position.set(s * 0.82, 0.55, 1.7); tBody.add(mg); }
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), clay(0xf6e7b0, 0.3)); hl.position.set(s * 0.5, 1.15, 2.55); tBody.add(hl); }
  const wheels = [];
  for (const [x, z] of [[-0.85, 1.7], [0.85, 1.7], [-0.85, -1.6], [0.85, -1.6]]) { const w = new THREE.Group(); w.position.set(x, 0.45, z); truck.add(w); const tyre = cyl(0.45, 0.45, 0.28, 16, tDark, 0, 0, 0, w); tyre.rotation.z = Math.PI / 2; const hub = cyl(0.18, 0.18, 0.3, 8, clay(0xb8a070), 0, 0, 0, w); hub.rotation.z = Math.PI / 2; wheels.push(w); }
  gun2.G.position.set(0, 0.9, -1.1); tBody.add(gun2.G);
  const rider = toy("soldier", 0x857548, 0x6e6040); rider.G.position.set(0, 0.9, -2.1); rider.G.scale.setScalar(0.95); tBody.add(rider.G);

  // farmers: the veteran at the farm, later both build the fence
  const vet = toy("farmer", 0x5f7f9a, 0x4a4036); scene.add(vet.G);
  nameTag("VETERAN PD I", "KINI PETANI GANDUM", vet.G, 2.6, A("s2:veteran"));
  const far2 = toy("farmer", 0xa0523a, 0x4a4036); scene.add(far2.G);
  const carry = box(0.12, 1.5, 0.12, clay(0x9a7448), 0.32, 1.1, 0.25, far2.G); carry.rotation.x = 1.2;
  const hammer = new THREE.Group(); vet.armR.add(hammer); box(0.05, 0.5, 0.05, woodM, 0, -0.62, 0.18, hammer).rotation.x = 1.4; box(0.12, 0.12, 0.25, gunM, 0, -0.62, 0.45, hammer);

  // rabbits slip through the broken fence
  const rabbits = [];
  const rabM = clay(0x9a8470), tailM = clay(0xf2ece0);
  for (let i = 0; i < 12; i++) {
    const G = new THREE.Group(); scene.add(G);
    const b = new THREE.Mesh(lump(new THREE.IcosahedronGeometry(0.3, 2), 0.05, i), rabM); b.scale.set(0.85, 0.8, 1.2); b.position.y = 0.28; b.castShadow = true; G.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), rabM); h.position.set(0, 0.48, 0.3); h.castShadow = true; G.add(h);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.26, 3, 6), rabM); e.position.set(s * 0.07, 0.72, 0.26); e.rotation.z = s * 0.2; e.castShadow = true; G.add(e); const ey = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), blackM); ey.position.set(s * 0.08, 0.52, 0.45); G.add(ey); }
    const tl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), tailM); tl.position.set(0, 0.32, -0.36); G.add(tl);
    rabbits.push({ G, x0: 4 + rnd() * 6, x1: -2 + rnd() * 16, z1: -14 + rnd() * 8, d: rnd() });
  }

  // ===== EMUS: instanced clay parts =====
  const bodyM = clay(EMU, 0.92), neckM = clay(0x7b8794, 0.8), legM = clay(0x6a5b4c, 0.85);
  const P = {
    body: inst(lump(new THREE.IcosahedronGeometry(1, 3), 0.07, 2), bodyM, N),
    tail: inst(lump(new THREE.IcosahedronGeometry(1, 1), 0.12, 5), bodyM, N),
    neck: inst(new THREE.CapsuleGeometry(0.1, 0.78, 4, 8), neckM, N),
    head: inst(new THREE.SphereGeometry(0.17, 12, 10), clay(0x6e7a88, 0.8), N),
    beak: inst(new THREE.ConeGeometry(0.06, 0.22, 8), clay(0x3a2f28, 0.6), N),
    eye: inst(new THREE.SphereGeometry(0.035, 8, 6), clay(0x0c0a08, 0.25), N * 2, false),
    leg: inst(new THREE.CapsuleGeometry(0.055, 0.92, 3, 6), legM, N * 2),
    foot: inst(new THREE.BoxGeometry(0.2, 0.06, 0.3), legM, N * 2),
  };
  const mats = Array.from({ length: 6 }, () => new THREE.Matrix4());
  const [mRoot, mPiv, mHead, mTmp, mTmp2, mLeg] = mats;
  const TR = (m, x, y, z) => m.makeTranslation(x, y, z);
  const tmpA = new THREE.Matrix4(), tmpB = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const comp_ = (out, base, ...ms) => { out.copy(base); for (const m of ms) out.multiply(m); return out; };
  const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
  const RX = (a) => new THREE.Matrix4().makeRotationX(a), RY = (a) => new THREE.Matrix4().makeRotationY(a), RZ = (a) => new THREE.Matrix4().makeRotationZ(a), S = (x, y, z) => new THREE.Matrix4().makeScale(x, y, z);
  // static part offsets
  const oBody = new THREE.Matrix4().compose(new THREE.Vector3(0, 1.22, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0)), new THREE.Vector3(0.56, 0.5, 0.8));
  const oTail = new THREE.Matrix4().compose(new THREE.Vector3(0, 1.1, -0.72), new THREE.Quaternion(), new THREE.Vector3(0.38, 0.34, 0.34));
  const oNeck = T(0, 0.42, 0), oHeadPos = T(0, 0.86, 0), oHeadS = S(0.85, 0.85, 1.15), oBeak = new THREE.Matrix4().compose(new THREE.Vector3(0, -0.02, 0.24), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1));
  const oEyeL = T(-0.12, 0.05, 0.07), oEyeR = T(0.12, 0.05, 0.07), oLegMid = T(0, -0.5, 0), oFoot = T(0, -1.0, 0.07), oNeckBase = T(0, 1.45, 0.48);
  const sd = []; for (let i = 0; i < N; i++) sd.push([rnd(), rnd(), rnd(), rnd(), rnd(), rnd()]);
  const ma = new THREE.Matrix4(), mb = new THREE.Matrix4(), mc = new THREE.Matrix4();
  function emu(i, o) {
    if (!o || o.s < 0.001) { for (const k of ["body", "tail", "neck", "head", "beak"]) P[k].setMatrixAt(i, zero); for (const k of ["eye", "leg", "foot"]) { P[k].setMatrixAt(i * 2, zero); P[k].setMatrixAt(i * 2 + 1, zero); } return; }
    const amp = o.amp || 0, ph = o.ph || 0, tip = o.tip || 0, peck = o.peck || 0;
    const bob = Math.abs(Math.sin(ph)) * 0.1 * amp + (o.hop || 0);
    ma.makeTranslation(o.x, bob + Math.sin(tip) * 0.42 * o.s, o.z);
    mRoot.copy(ma).multiply(mb.makeRotationY(o.yaw || 0)).multiply(mb.makeRotationZ(tip)).multiply(mb.makeScale(o.s, o.s * (o.sq || 1), o.s));
    P.body.setMatrixAt(i, mc.copy(mRoot).multiply(oBody));
    P.tail.setMatrixAt(i, mc.copy(mRoot).multiply(oTail));
    const lean = 0.28 + 0.4 * amp + peck * 1.55;
    mPiv.copy(mRoot).multiply(oNeckBase).multiply(mb.makeRotationX(lean)).multiply(ma.makeRotationZ(o.tilt || 0));
    P.neck.setMatrixAt(i, mc.copy(mPiv).multiply(oNeck));
    mHead.copy(mPiv).multiply(oHeadPos).multiply(mb.makeRotationX(-lean * 0.85 + (o.look || 0)));
    P.head.setMatrixAt(i, mc.copy(mHead).multiply(oHeadS));
    P.beak.setMatrixAt(i, mc.copy(mHead).multiply(oBeak));
    P.eye.setMatrixAt(i * 2, mc.copy(mHead).multiply(oEyeL));
    P.eye.setMatrixAt(i * 2 + 1, mc.copy(mHead).multiply(oEyeR));
    for (let s = 0; s < 2; s++) {
      const sw = Math.sin(ph + s * Math.PI) * 0.62 * amp;
      mLeg.copy(mRoot).multiply(ma.makeTranslation(s ? 0.17 : -0.17, 1.02, 0.02)).multiply(mb.makeRotationX(sw));
      P.leg.setMatrixAt(i * 2 + s, mc.copy(mLeg).multiply(oLegMid));
      P.foot.setMatrixAt(i * 2 + s, mc.copy(mLeg).multiply(oFoot));
    }
  }

  // ===== particles =====
  const puff = pts(scene, 160, { color: 0xe8b07a, size: 0.9, add: false, opacity: 0.85 });
  const smoke = pts(scene, 70, { color: 0x8a8580, size: 1.4, add: false, opacity: 0.8 });
  const spark = pts(scene, 90, { color: 0xffb040, size: 0.35 });
  const shells = pts(scene, 120, { color: 0xe0b050, size: 0.22 });
  const dustFly = pts(scene, 300, { color: 0xffe6b0, size: 0.25, opacity: 0.55 });
  const flySeed = []; for (let i = 0; i < 300; i++) flySeed.push([rnd(), rnd(), rnd(), rnd()]);

  // ===== timing =====
  const t1932 = A("s1:tentara"), tBurung = A("s1:burung"), tMenang = A("s1:burungnya");
  const tVet = A("s2:veteran"), tDep = A("s2:Depresi"), tJatuh = A("s2:jatuh");
  const tRusak = A("s3:dirusak"), tKel = A("s3:kelinci");
  const tSetuju = A("s4:setuju"), tLewis = A("s4:Lewis"), tSepuluh = A("s4:sepuluh");
  const tBerp = A("s5:berpencar"), tSeribu = A("s5:seribu"), tMacet = A("s5:macet"), tTruk = A("s5:truk"), tKalah = A("s5:kalah");
  const tTarik = A("s6:ditarik"), tKirim = A("s6:dikirim"), tShots = A("s6:9.860"), tRagu = A("s6:diragukan");
  const tSen7 = A("s7:senapan"), tTank = A("s7:tank"), tTolak = A("s7:ditolak"), tPetani = A("s7:Petani");
  const tPagar8 = A("s8:pagar");
  const tipList = []; for (const g of [5, 6, 9, 10]) for (let m = 0; m < 3; m++) tipList.push(1 + g * 10 + m);
  const tipStep = (tMacet - tSeribu - 0.35) / 12;
  const tipAt = new Map(tipList.map((i, k) => [i, tSeribu + 0.25 + k * tipStep]));
  const firing = (t) => (t > t1932 && t < tBurung + 0.5) || (t > tSeribu && t < tMacet) || (t > tTruk + 0.4 && t < K.s5e) || (t > tSen7 && t < tTank + 0.7);
  const atBattle = (t) => t < K.s2 || (t >= K.s5 - 0.4 && t < K.s6) || (t >= K.s7 - 0.4);
  const truckX = (tq) => BAT - 13 + Math.max(0, tq - tTruk) * 5.5;
  const GUN = [BAT - 6, 6];

  // battlefield group centres
  const bc = (g, tq) => {
    const q = sd[g * 10 + 3];
    let x = BAT + 2 + ((g % 4) - 1.5) * 2.6, z = -22 + ((g >> 2) - 1.5) * 2.4;
    const sp = ramp(tq, tBerp - 0.2, tBerp + 1.6);
    x += (BAT - 26 + (g % 4) * 16 + (q[0] - 0.5) * 6 - x) * sp; z += (-38 + (g >> 2) * 7.5 + (q[1] - 0.5) * 3 - z) * sp;
    if (g >= 4 && g < 12) { const ap = ramp(tq, tSeribu - 0.4, tMacet) * 0.8; x += (BAT - 5 + ((g % 4) - 1.5) * 3.2 - x) * ap; z += (-5 - ((g >> 2) - 1) * 2.6 - z) * ap; }
    z -= 7 * ramp(tq, tMacet + 0.6, tMacet + 3.5);
    if (g === 15 && tq > tTruk - 0.3) { x = BAT - 4 + (tq - tTruk) * 7.5; z = 9.2; }
    return [x, z];
  };
  const idleB = (i, tq) => { const q = sd[i]; const x = BAT - 22 + q[0] * 44 + Math.sin(tq * 0.3 + q[3] * 6) * 0.6, z = -40 + q[1] * 30; return { x, z, s: 0.8, yaw: q[2] * 6.28 + Math.sin(tq * 0.4 + q[4] * 9) * 0.5, peck: Math.sin(tq * 2.2 + q[5] * 20) > 0.25 ? 1 : 0 }; };

  // camera path over the table
  const MID1 = (CAMP + BAT) / 2, MID2 = (BAT + FEN) / 2, tLew = A("s4:Lewis");
  const keys = [
    [0, BAT - 15, 3.4, 21, BAT - 3, 2.0, -3],
    [tBurung, BAT - 10, 3.8, 18, BAT - 1, 1.9, -2],
    [K.s1e - 0.3, BAT - 4.5, 3.2, 12.5, BAT + 1.2, 1.7, 0],
    [K.s1e, BAT - 4.4, 3.25, 12.4, BAT + 1.2, 1.7, 0],
    [K.s2 + 1.3, 46, 30, 66, 22, 0, -6],
    [K.s2 + 2.9, -4, 18, 44, 0, 2, -8],
    [tDep, 2, 8, 22, -5, 2.2, -8],
    [K.s2e, 8, 11, 28, 1, 2, -9],
    [K.s3 + 1.6, 6, 26, 26, 4, 0, -36],
    [K.s3 + 3.6, 7, 15, 6, 4, 0.5, -34],
    [eatT, 13, 9, 25, 6, 1.4, 0],
    [tKel, 12, 13, -1, 7, 0.4, -24],
    [K.s3e, 13, 12, 1, 8, 0.4, -21],
    [K.s4 + 1.4, 40, 8, 21, 46, 2.6, 4],
    [tSetuju, 43.5, 5.4, 14.5, 46.3, 2.7, 5],
    [A("s4:Meredith"), CAMP - 1.5, 4.9, 14.5, CAMP - 0.3, 2.3, 2.6],
    [tLew, CAMP - 0.9, 5.1, 15.2, CAMP + 0.4, 2.3, 2.6],
    [K.s4e, CAMP + 2.5, 6, 17, CAMP + 3.6, 1.7, 1.5],
    [K.s4e + 0.15, CAMP + 2.6, 6.1, 17.1, CAMP + 3.7, 1.7, 1.5],
    [K.s5 + 0.9, MID1, 26, 50, MID1 + 10, 0, -10],
    [K.s5 + 2.3, BAT - 12, 20, 34, BAT, 0, -12],
    [tBerp + 0.6, BAT - 5, 25, 32, BAT + 2, 0, -18],
    [A("s5:mendekat"), BAT - 10, 4.6, 20, BAT - 4, 1.8, -1],
    [tMacet + 0.25, BAT - 8.6, 3.0, 13.2, BAT - 6, 1.3, 6.5],
    [tTruk, BAT - 6, 10, 36, BAT - 4, 1, 8],
    [K.s5e, BAT + 2, 11, 37, BAT + 4, 1, 8],
    [K.s5e + 0.15, BAT + 2.2, 11, 37, BAT + 4.2, 1, 8],
    [K.s6 + 1.1, MID1, 26, 50, MID1 - 6, 0, -6],
    [K.s6 + 2.6, CAMP - 7, 11, 28, CAMP - 1, 3, 1],
    [tKirim + 0.3, CAMP - 3, 7.5, 20, CAMP - 2.5, 3.2, 3],
    [A("s6:Sampai") + 0.8, CAMP + 1.5, 6.5, 15, CAMP + 4.6, 1.6, 1],
    [A("s6:Tepat"), CAMP + 3.5, 5, 12, CAMP + 4.6, 1.8, 1],
    [K.s6e - 0.6, CAMP + 5.5, 6.3, 14, CAMP + 4.7, 2.3, 1],
    [K.s7 + 0.8, MID1, 20, 42, MID1 + 6, 1, -6],
    [K.s7 + 2.3, BAT - 1.5, 2.6, 13, BAT, 1.9, 0],
    [tTolak, BAT + 1.5, 6, 20, BAT, 1.5, -2],
    [(tTolak + tPetani) / 2 + 0.9, MID2, 20, 44, MID2 + 6, 1, -6],
    [tPetani + 1.9, FEN - 8, 10, 30, FEN - 2, 1.5, 0],
    [K.s8 + 3, FEN, 6, 20, FEN + 2, 1.4, -2],
    [tPagar8, FEN + 5, 5, 17, FEN + 6, 1.4, -1],
    [K.end, FEN + 8, 11, 31, FEN + 6, 2, -4],
    [K.dur, FEN + 9, 13, 35, FEN + 6, 2, -4],
  ].sort((a, b) => a[0] - b[0]);
  const camT = track(keys);
  const pulse = (t, a, k = 6) => (t > a ? Math.exp(-(t - a) * k) : 0);

  let lastQ = -1;
  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check("700 40px Fredoka") && document.fonts.check("900 30px Nunito")) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } }
    const tq = Math.floor(t * 12 + 1e-6) / 12;
    const tick = Math.floor(t * 12 + 1e-6);
    const c = camT(t);
    const sh = 0.16 * pulse(t, tMacet, 7) + 0.08 * pulse(t, tSetuju, 8) + 0.06 * pulse(t, tRagu, 8);
    cam.position.set(c[0] + Math.sin(t * 0.43) * 0.35 + Math.sin(t * 41) * sh, c[1] + Math.cos(t * 0.37) * 0.2 + Math.sin(t * 57) * sh, c[2] + Math.sin(t * 0.29) * 0.3);
    cam.lookAt(c[3], c[4], c[5]);
    dome.position.copy(cam.position); sky.position.set(cam.position.x, 0, cam.position.z);
    for (let k = 0; k < clouds.length; k++) clouds[k].position.x = -160 + k * 46 + ((t * 0.6) % 46);
    key.target.position.set(c[3], 0, c[5]); key.position.set(c[3] + 30, 52, c[5] - 26);

    // toys are posed only when the 12 fps clock ticks (and on the first frame)
    const bat = atBattle(t);
    // soldiers + gun
    if (bat) {
      mer.G.position.set(GUN[0] - 1.4, 0, GUN[1] + 0.7); mer.G.rotation.y = Math.PI * 0.9;
      gnr.G.position.set(GUN[0] + 0.2, 0, GUN[1] + 1.25); gnr.G.rotation.y = Math.PI;
      sgt.G.position.set(GUN[0] + 1.6, 0, GUN[1] + 0.9); sgt.G.rotation.y = Math.PI * 1.1;
      gun1.G.position.set(GUN[0], 0, GUN[1]); gun1.G.rotation.y = Math.PI + (t > K.s7 - 0.4 ? -0.55 : 0.12);
    } else {
      mer.G.position.set(CAMP, 0, 3); mer.G.rotation.y = 0.1;
      sgt.G.position.set(CAMP + 1.3, 0, 2.1); sgt.G.rotation.y = -0.3;
      gnr.G.position.set(CAMP - 1.4, 0, 1.6); gnr.G.rotation.y = 0.4;
      gun1.G.position.set(CAMP + 1.7, 0, 4.4); gun1.G.rotation.y = 0.6;
    }
    const gunPop = bat ? 1 : back(Math.floor((t - tLewis) * 12) / 12 / 0.3);
    gun1.G.scale.setScalar(Math.max(0.001, gunPop));
    // gun jam jolt + firing flash
    const fire = firing(t), flick = fire && tick % 2 === 0;
    gun1.flash.visible = flick && !(t > tTruk && t < K.s5e); gun1.L.intensity = gun1.flash.visible ? 10 : 0;
    gun2.flash.visible = flick && t > tTruk && t < K.s5e; gun2.L.intensity = gun2.flash.visible ? 10 : 0;
    gun1.G.position.y = fire && tick % 2 ? 0.03 : 0;
    if (t > tMacet && t < tMacet + 0.6) gun1.G.rotation.z = (tick % 2 ? 0.12 : -0.12) * (1 - (t - tMacet) / 0.6);
    else gun1.G.rotation.z = 0;
    // Meredith slumps after the jam, shakes a fist when the truck loses
    mer.head.rotation.x = t > tMacet && t < K.s6 ? 0.35 : 0;
    mer.armR.rotation.x = t > tKalah && t < K.s6 ? -2.6 + (tick % 2) * 0.3 : 0;
    gnr.armL.rotation.x = gnr.armR.rotation.x = bat && t < K.s6 ? -1.1 : 0;
    sgt.armR.rotation.x = t > tMacet && t < tMacet + 2.5 ? -2.4 + (tick % 2) * 0.4 : 0;
    // camp flag: down when the troops are withdrawn, up again when they return
    const fy = 3.8 - 2.7 * ramp(tq, tTarik, tTarik + 0.6) + 2.7 * ramp(tq, tKirim, tKirim + 0.6);
    flag.position.y = fy;
    const fp = flag.geometry.attributes.position;
    for (let i = 0; i < fp.count; i++) fp.array[i * 3 + 2] = flagBase[i * 3 + 2] + Math.sin(tq * 6 + flagBase[i * 3] * 3) * 0.12 * (flagBase[i * 3] + 0.65);
    fp.needsUpdate = true;

    // truck: parked at camp, then the chase it loses
    if (t >= K.s5 - 0.4 && t < K.s6) {
      const x = truckX(tq), mov = tq > tTruk ? 1 : 0;
      truck.position.set(x, 0, 9.3); truck.rotation.y = Math.PI / 2;
      tBody.position.y = Math.abs(Math.sin(tq * 17)) * 0.22 * mov; tBody.rotation.z = Math.sin(tq * 13) * 0.07 * mov; tBody.rotation.x = Math.sin(tq * 9) * 0.05 * mov;
      for (const w of wheels) w.rotation.x = -(x - (BAT - 13)) / 0.45;
    } else { truck.position.set(CAMP + 9, 0, -4); truck.rotation.y = -0.5; tBody.position.y = 0; tBody.rotation.set(0, 0, 0); }

    // Pearce nods and stamps
    pearce.head.rotation.x = t > tSetuju - 0.3 && t < tSetuju + 0.6 ? (tick % 3 === 0 ? 0.3 : 0) : 0;
    const sd_ = clamp01((tq - (tSetuju - 0.25)) / 0.25);
    stampG.position.y = 2.06 + (t < tSetuju - 0.25 ? 0.5 : t < tSetuju ? 0.5 * (1 - sd_) : 0.5 * ramp(tq, tSetuju + 0.3, tSetuju + 0.6));
    okMark.visible = t > tSetuju;
    pearce.armR.rotation.x = t > tSetuju - 0.3 && t < tSetuju + 0.5 ? -1.2 : 0;

    // farmers
    const frontierK = Math.max(0, Math.min(newPosts, Math.floor((t - tPetani - 0.2) / 0.32) + 1));
    if (t < K.s7 + 2) {
      vet.G.position.set(-4.5, 0, -6.5); vet.G.rotation.y = 0.35;
      vet.head.rotation.x = t > tDep + 0.4 ? 0.4 : 0; vet.armR.rotation.x = 0; hammer.visible = false;
      far2.G.position.set(-6, 0, -40); far2.G.visible = false;
    } else {
      const fx = FEN - 25 + Math.max(1, frontierK) * 2;
      vet.G.position.set(fx + 0.2, 0, 0.9); vet.G.rotation.y = -0.6; vet.head.rotation.x = 0.2; hammer.visible = true;
      vet.armR.rotation.x = -1.6 + (tick % 3) * 0.6;
      far2.G.visible = true; far2.G.position.set(fx + 3 + Math.sin(tq * 2) * 0.5, Math.abs(Math.sin(tq * 9)) * 0.08, 2.2); far2.G.rotation.y = -Math.PI / 2 + 0.3;
      far2.armL.rotation.x = far2.armR.rotation.x = -0.8;
    }

    // name tags pop in stop-motion and face the lens
    for (const g of tags) { const k = Math.floor((t - g.at) * 12) / 12; const s = t < g.at ? 0 : back(k / 0.33); g.m.scale.setScalar(Math.max(0.001, s)); g.m.visible = s > 0.01; g.m.quaternion.copy(cam.quaternion); if (g.m.parent) { const pq = new THREE.Quaternion(); g.m.parent.getWorldQuaternion(pq); g.m.quaternion.premultiply(pq.invert()); } }

    // price arrow flips down at "jatuh"
    arrow.rotation.z = -0.5 - 2.3 * ramp(Math.floor(t * 12) / 12, tJatuh - 0.4, tJatuh + 0.2) - Math.sin(tq * 9) * 0.04 * (t > tJatuh ? 1 : 0);
    fan.rotation.z = -tq * 2.4;

    // crates pop in one by one, then their lids open as the shots are counted
    for (const cr of crates) {
      const at = tSepuluh + cr.i * 0.09;
      const k = Math.floor((t - at) * 12) / 12;
      cr.C.scale.setScalar(t < at ? 0.001 : Math.max(0.001, back(k / 0.3)));
      const op = tShots - 0.2 + cr.i * 0.15;
      cr.lidP.rotation.x = -1.9 * ramp(tq, op, op + 0.17);
      cr.brass.visible = false;
    }
    const qk = Math.floor((t - tRagu) * 12) / 12;
    quest.scale.setScalar(t < tRagu ? 0.001 : Math.max(0.001, back(qk / 0.35)) * 1.0 * (1 - ramp(t, K.s6e - 0.2, K.s6e + 0.2)) + 0.001);
    quest.rotation.y = Math.sin(tq * 3) * 0.3; quest.rotation.z = Math.sin(tq * 5) * 0.08;

    // ===== emus =====
    if (tick !== lastQ) {
      lastQ = tick;
      const boil = (i) => 1 + ((Math.sin(i * 12.9898 + tick * 78.233) * 43758.5453) % 1) * 0.02;
      // battlefield population
      for (let i = 0; i < NB; i++) {
        const q = sd[i];
        let o = null;
        if (t < K.s2 + 1) {
          if (i === 0) {
            const hop = t > tMenang ? Math.abs(Math.sin((tq - tMenang) * 9)) * 0.35 * Math.exp(-(tq - tMenang) * 1.2) : 0;
            o = { x: BAT + 1.2, z: 0.6, s: 0.82, yaw: -0.5 + (t > tMenang ? 0.15 : Math.sin(tq * 1.5) * 0.4), peck: t > tMenang ? -0.35 : (Math.sin(tq * 2) > 0.5 ? 1 : 0), hop, look: t > tMenang ? -0.3 : 0 };
          } else if (i < 70) {
            const v = 5 + q[1] * 2.2;
            o = { x: BAT - 30 + ((q[0] * 60 + tq * v) % 60), z: -19 + q[2] * 16, s: 0.8, yaw: Math.PI / 2, amp: 1, ph: tq * v * 1.5 + q[3] * 6.28 };
          }
        } else if (t >= K.s5 - 0.6 && t < K.s6 && i >= 1 && i <= 160) {
          const g = (i - 1) / 10 | 0, m = (i - 1) % 10;
          const tipT = tipAt.get(i);
          const tt = tipT !== undefined && tq > tipT ? tipT : tq;
          const c0 = bc(g, tt), c1 = bc(g, tt + 0.25);
          const spread = 0.55 + 0.45 * ramp(tt, tBerp - 0.2, tBerp + 1.6);
          const a = q[0] * 6.28, rr_ = (0.7 + q[1] * 1.8) * spread * (g === 15 && tq > tTruk ? 0.7 : 1);
          const vx = c1[0] - c0[0], vz = c1[1] - c0[1], vel = Math.hypot(vx, vz) / 0.25;
          const amp = clamp01(vel / 1.5);
          o = { x: c0[0] + Math.cos(a) * rr_, z: c0[1] + Math.sin(a) * rr_, s: 0.8, amp, ph: tt * (4 + vel * 1.2) + q[3] * 6.28, yaw: amp > 0.15 ? Math.atan2(vx, vz) : q[2] * 6.28 + Math.sin(tt * 0.5 + q[4] * 7) * 0.4, peck: amp > 0.15 ? 0 : (Math.sin(tt * 2.2 + q[5] * 20) > 0.3 ? 1 : 0) };
          if (tipT !== undefined && tq > tipT) { o.tip = Math.PI / 2 * clamp01((tq - tipT) / 0.25); o.amp = 0; }
        } else if (t >= K.s7 - 0.4 && i === 0) {
          const u = clamp01((tq - K.s7) / (tTolak - K.s7 + 1.5));
          o = { x: BAT + 0.4, z: -10 + 14 * u, s: 1.0, yaw: 0, amp: 0.75, ph: tq * 7, look: -0.15 };
        } else if (i > 0) o = idleB(i, tq);
        if (o && o.s > 0.01) o.s *= boil(i);
        emu(i, o);
      }
      // farm population: arrives during s3, stays and eats
      for (let k = 0; k < NF; k++) {
        const i = NB + k, q = sd[i];
        const ta = K.s3 + 0.3 + Math.pow(k / NF, 0.8) * 3.2;
        if (t < ta) { emu(i, null); continue; }
        const sx = -14 + q[0] * 40, sz = -44;
        let tx = -18 + q[1] * 44; const tz = -34 + q[2] * 46; if (tx > 1 && tx < 15 && tz > -34 && tz < -8) tx += tx < 8 ? -9 : 9;
        const dist = Math.hypot(tx - sx, tz - sz), dur = Math.min(dist / 6.5, 3.2);
        const u = clamp01((tq - ta) / dur);
        const walking = u < 1;
        const x = sx + (tx - sx) * u + (walking ? 0 : Math.sin(tq * 0.35 + q[3] * 6) * 0.5), z = sz + (tz - sz) * u + (walking ? 0 : Math.cos(tq * 0.3 + q[4] * 6) * 0.4);
        const appear = Math.min(1, (tq - ta) / 0.25);
        emu(i, { x, z, s: 0.8 * appear * boil(i), amp: walking ? 1 : 0, ph: tq * 6 + q[3] * 6.28, yaw: walking ? Math.atan2(tx - sx, tz - sz) : q[5] * 6.28 + Math.sin(tq * 0.5 + q[4] * 5) * 0.6, peck: walking ? 0 : (Math.sin(tq * 2.4 + q[5] * 30) > 0.2 ? 1 : 0) });
      }
      // fence population: strolls past the new fence at the end
      for (let k = 0; k < NE; k++) {
        const i = NB + NF + k, q = sd[i];
        if (t < tPetani - 2) { emu(i, null); continue; }
        if (k === 0) {
          const nod = t > tPagar8 ? (tick % 4 < 2 ? 0.25 : -0.1) : 0;
          emu(i, { x: FEN + 6, z: -1.4, s: 0.84 * boil(i), yaw: 0.15, peck: -0.2, look: nod, tilt: Math.sin(tq * 1.7) * 0.15 });
          continue;
        }
        const v = 0.7 + q[1] * 0.6;
        const x = FEN - 32 + ((q[0] * 64 + tq * v) % 64);
        const stop = Math.sin(tq * 0.9 + q[4] * 9) > 0.55;
        emu(i, { x, z: -3.5 - q[2] * 9, s: 0.8 * boil(i), yaw: Math.PI / 2, amp: stop ? 0 : 0.55, ph: tq * 5 + q[3] * 6.28, peck: stop ? 1 : 0 });
      }
      for (const k in P) P[k].instanceMatrix.needsUpdate = true;

      // rabbits hop through the broken fence
      for (let k = 0; k < rabbits.length; k++) {
        const R = rabbits[k], st = tKel + k * 0.17, u = clamp01((tq - st) / 2.6);
        R.G.visible = tq > st;
        const x = R.x0 + (R.x1 - R.x0) * u, z = -33 + (R.z1 + 33) * u;
        R.G.position.set(x, Math.abs(Math.sin(u * Math.PI * 6)) * 0.45 * (u < 1 ? 1 : 0), z);
        R.G.rotation.y = Math.atan2(R.x1 - R.x0, R.z1 + 33);
      }
    }

    // farm fence: posts tip over at "dirusak", their wires drop
    const broke = (x) => x >= 2 && x <= 12;
    for (let k = 0; k < farmPosts.length; k++) {
      const x = farmPosts[k], b = broke(x) ? ramp(tq, tRusak + (x - 2) * 0.05, tRusak + (x - 2) * 0.05 + 0.25) : 0;
      dummy.position.set(x, 0.75 - 0.4 * b, FZ); dummy.rotation.set(-1.3 * b, 0, (k % 2 ? 0.3 : -0.3) * b); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); fpI.setMatrixAt(k, dummy.matrix);
      if (k < farmPosts.length - 1) for (let h = 0; h < 3; h++) {
        const bb = broke(x) || broke(x + 2) ? ramp(tq, tRusak, tRusak + 0.4) : 0;
        dummy.position.set(x + 1, (0.45 + h * 0.38) * (1 - bb) + 0.05 * bb, FZ + bb * (h - 1) * 0.4); dummy.rotation.set(0, bb * (h - 1) * 0.3, 0); dummy.updateMatrix(); fwI.setMatrixAt(k * 3 + h, dummy.matrix);
      }
    }
    fpI.instanceMatrix.needsUpdate = fwI.instanceMatrix.needsUpdate = true;
    // new fence grows post by post
    for (let k = 0; k < newPosts; k++) {
      const at = tPetani + 0.2 + k * 0.32, kk = Math.floor((t - at) * 12) / 12;
      const s = t < at ? 0 : back(kk / 0.25);
      dummy.position.set(FEN - 25 + k * 2, 0.8 * s, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, Math.max(0.001, s), 1); dummy.updateMatrix(); npI.setMatrixAt(k, dummy.matrix);
      if (k < newPosts - 1) for (let h = 0; h < 3; h++) {
        const on = t > at + 0.32 + 0.1;
        dummy.position.set(FEN - 24 + k * 2, 0.45 + h * 0.4, 0); dummy.scale.set(on ? 1 : 0.001, 1, 1); dummy.updateMatrix(); nwI.setMatrixAt(k * 3 + h, dummy.matrix);
      }
    }
    dummy.scale.set(1, 1, 1);
    npI.instanceMatrix.needsUpdate = nwI.instanceMatrix.needsUpdate = true;

    // wheat sways smoothly in the wind; emus crop the farm field after "dimakan"
    for (let k = 0; k < wheat.length; k++) {
      const w = wheat[k];
      const eaten = w[5] === 0 && w[3] < 0.6 ? ramp(t, eatT + w[4] * 4, eatT + w[4] * 4 + 0.5) : 0;
      dummy.position.set(w[0], 0, w[1]); dummy.rotation.set(Math.sin(t * 1.3 + w[0] * 0.25) * 0.05, 0, Math.sin(t * 1.6 + w[0] * 0.35 + w[1] * 0.2) * 0.08 + eaten * (w[4] - 0.5) * 1.2);
      dummy.scale.set(1, w[2] * (1 - 0.72 * eaten), 1); dummy.updateMatrix();
      stalkI.setMatrixAt(k, dummy.matrix); headI.setMatrixAt(k, eaten > 0.9 ? zero : dummy.matrix);
    }
    dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
    stalkI.instanceMatrix.needsUpdate = headI.instanceMatrix.needsUpdate = true;

    // particles: dust puffs where bullets land, jam smoke, sparks off the "tank" emu, brass in the open crates
    const pp = puff.pos;
    for (let i = 0; i < 160; i++) {
      const age = (i % 8) / 12 + (t * 12 - tick) / 12, born = tick - (i % 8), bt = born / 12;
      const live = firing(bt) && atBattle(bt) && age < 0.66;
      const h = Math.sin(born * 91.7 + (i >> 3) * 13.1) * 43758.5;
      const f = h - Math.floor(h), f2 = (h * 7.3) - Math.floor(h * 7.3);
      let cx = BAT - 4 + (f - 0.5) * 18, cz = -6 - f2 * 14;
      if (bt > tTruk && bt < K.s6) { cx = truckX(bt) + 6 + f * 8; cz = 6 + f2 * 6; }
      if (bt > K.s7 - 0.4) { cx = BAT + 0.4 + (f - 0.5) * 4; cz = -4 - f2 * 6; }
      pp[i * 3] = live ? cx + Math.sin(i) * age * 1.2 : 0; pp[i * 3 + 1] = live ? 0.2 + age * 2.2 : -50; pp[i * 3 + 2] = live ? cz + Math.cos(i) * age : 0;
    }
    puff.m.opacity = 0.8; puff.commit();
    const sm = smoke.pos, sa = t - tMacet;
    for (let i = 0; i < 70; i++) { const q = sd[i], on = sa > 0 && sa < 2.4 && t < K.s6; const u = clamp01(sa / 2.4); sm[i * 3] = on ? GUN[0] + (q[0] - 0.5) * 1.6 * u + 0.1 : 0; sm[i * 3 + 1] = on ? 0.5 + q[1] * 2.6 * u + u * 0.8 : -50; sm[i * 3 + 2] = on ? GUN[1] - 0.6 + (q[2] - 0.5) * 1.4 * u : 0; }
    smoke.m.opacity = 0.8 * (1 - ramp(t, tMacet + 1.4, tMacet + 2.4)); smoke.commit();
    const spp = spark.pos;
    for (let i = 0; i < 90; i++) { const q = sd[i + 10], life = ((q[0] + t * (1.5 + q[1])) % 1); const on = t > tSen7 && t < tTank + 0.7; const ez = -10 + 14 * clamp01((t - K.s7) / (tTolak - K.s7 + 1.5)); spp[i * 3] = on ? BAT + 0.4 + (q[2] - 0.5) * 0.8 + (q[3] - 0.5) * 3 * life : 0; spp[i * 3 + 1] = on ? 1.2 + q[4] * 0.6 + 2 * life - 3 * life * life : -50; spp[i * 3 + 2] = on ? ez + 0.3 + (q[5] - 0.5) * 2 * life : 0; }
    spark.commit();
    const shp = shells.pos;
    for (let i = 0; i < 120; i++) { const q = sd[i + 200], cr = crates[i % 10], op = tShots - 0.2 + cr.i * 0.15, dt = t - op - 0.1, on = dt > 0 && dt < 1.4 && t < K.s6e; const p = cr.C.position; shp[i * 3] = on ? p.x + (q[0] - 0.5) * 0.6 + (q[1] - 0.5) * 2 * dt : 0; shp[i * 3 + 1] = on ? p.y + 0.6 + 3 * dt * (0.5 + q[2]) - 6 * dt * dt : -50; shp[i * 3 + 2] = on ? p.z + (q[3] - 0.5) * 1.6 * dt : 0; }
    shells.commit();
    // warm floating dust motes near the lens keep depth everywhere
    const dp = dustFly.pos;
    for (let i = 0; i < 300; i++) { const f = flySeed[i]; dp[i * 3] = c[3] + (f[0] - 0.5) * 30 + Math.sin(t * 0.3 + f[3] * 6) * 1.5; dp[i * 3 + 1] = 0.5 + ((f[1] * 9 + t * 0.15 * (0.5 + f[2])) % 9); dp[i * 3 + 2] = c[5] + (f[2] - 0.5) * 30; }
    dustFly.commit();

    bp.strength = 0.22 + 0.25 * (fire ? 1 : 0) * 0.4;
    comp.render();
  };
}
