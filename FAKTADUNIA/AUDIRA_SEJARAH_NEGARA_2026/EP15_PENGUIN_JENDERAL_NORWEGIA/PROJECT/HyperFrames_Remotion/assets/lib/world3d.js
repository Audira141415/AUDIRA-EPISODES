// EP15 BRICKCRAFT: a sunny living-room tabletop of studded toy bricks. Two stations on one oak table:
// Z  the Edinburgh zoo enclosure (pool, rocks, colony, fence, sign) with a three-tier parade podium for the hero
//    king penguin and a grey parade lawn where the brick guard platoon stands in 13 x 10 rows (130),
// T  the 1961 Military Tattoo esplanade: castle gatehouse, two grandstands of brick spectators, flags.
// Toy parts move on twos (stepped time), the camera moves on ones. Insignia bricks fly in on an arc and snap on.
// Station changes happen under the HTML brick wipe. Everything is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, back, envStrips } from "./lib3d.js";

const RED = "#BA0C2F", NAVY = "#00205B", TB = "#0A57C2", YEL = "#FFC21A", WH = "#F7F5EE", GRN = "#3FA34D", ORG = "#F28C28";
const BLK = "#1C2230", GOLD = "#E8B23A", UNI = "#1B2440", PEACH = "#E9B48C";
const V3 = THREE.Vector3;

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

const TILT = {
  uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2(1 / 1080, 0) }, focus: { value: 0.47 }, band: { value: 0.2 }, amt: { value: 0.8 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: "uniform sampler2D tDiffuse;uniform vec2 dir;uniform float focus,band,amt;varying vec2 vUv;void main(){float d=max(0.,abs(vUv.y-focus)-band);float r=clamp(d*20.,0.,4.5)*amt;vec4 s=vec4(0.);float w=0.;for(int i=-6;i<=6;i++){float f=float(i);float k=exp(-f*f/14.);s+=texture2D(tDiffuse,vUv+dir*f*r)*k;w+=k;}gl_FragColor=s/w;}",
};

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xead7ba, fog: 0.0042, exp: 1.0, bloom: [0.1, 0.4, 0.93] });
  const tiltH = new ShaderPass(TILT), tiltV = new ShaderPass(TILT);
  tiltV.uniforms.dir.value.set(0, 1 / 1920);
  comp.insertPass(tiltH, 2); comp.insertPass(tiltV, 3);
  envStrips(r, scene, [[40, 14, 0xfff2dd, 2.4, -40, 40, 30], [30, 10, 0xffffff, 1.6, 40, 30, -20], [70, 8, 0xffe2b8, 1.2, 0, 60, 0]], 0x7a6650);
  const rnd = mulberry(1972);
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x9a7050, 0.75);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe0b0, 2.3);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 320 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xd8e6ff, 0.45); fill.position.set(80, 40, 60); scene.add(fill);

  // ---------- materials ----------
  const mats = {};
  const plast = (c) => mats[c] || (mats[c] = new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.2 }));
  const white = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.2 });
  const boxG = new THREE.BoxGeometry(1, 1, 1);
  const studG = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14); studG.translate(0, 0.1, 0);

  // ---------- static brick collector (two instanced draws for the whole world) ----------
  const BR = [], ST = [];
  const brick = (x, y, z, w, h, d, col, studs = true) => {
    BR.push([x, y + h / 2, z, w - 0.05, h - 0.03, d - 0.05, col]);
    if (studs) for (let i = 0; i < Math.floor(w + 0.01); i++) for (let j = 0; j < Math.floor(d + 0.01); j++) ST.push([x - w / 2 + 0.5 + i, y + h, z - d / 2 + 0.5 + j, col]);
  };
  const add = (m, p = scene) => { m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const M = (w, h, d, c, x, y, z, p) => { const m = new THREE.Mesh(boxG, typeof c === "string" ? plast(c) : c); m.scale.set(w - 0.04, h - 0.03, d - 0.04); m.position.set(x, y + h / 2, z); return add(m, p); };
  const stud = (x, y, z, c, p) => { const m = new THREE.Mesh(studG, plast(c)); m.position.set(x, y, z); return add(m, p); };

  // canvas labels repainted once web fonts are ready
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const F = (wt, px) => `${wt} ${px}px 'Baloo 2', sans-serif`;
  const tileMesh = (w, h, d, tx, col, x, y, z, p) => {
    const side = plast(col), front = new THREE.MeshPhysicalMaterial({ map: tx, roughness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.2 });
    const m = new THREE.Mesh(boxG, [side, side, side, side, front, side]); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z); return add(m, p);
  };

  // ---------- oak table + room props ----------
  const woodT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#C48A55"; g.fillRect(0, 0, w, h);
    const q = mulberry(9);
    for (let i = 0; i < 260; i++) { const y0 = q() * h; g.strokeStyle = q() < 0.5 ? `rgba(240,190,130,${0.05 + q() * 0.1})` : `rgba(90,50,20,${0.06 + q() * 0.1})`; g.lineWidth = 1 + q() * 4; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.005 + i) * 10); g.stroke(); }
    for (let k = 0; k < 4; k++) { g.strokeStyle = "rgba(80,45,20,.25)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, k * 256 + 2); g.lineTo(w, k * 256 + 2); g.stroke(); }
  }, [10, 7]);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(800, 560), new THREE.MeshStandardMaterial({ map: woodT, roughness: 0.55 }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
  // a mug and a book stack far behind, soft in the tilt-shift
  add(new THREE.Mesh(new THREE.CylinderGeometry(11, 10, 22, 40), new THREE.MeshPhysicalMaterial({ color: 0xf4f0e6, roughness: 0.3, clearcoat: 1 }))).position.set(70, 11, -75);
  M(48, 6, 34, "#2F5D8C", -40, 0, -95); M(44, 5, 30, "#B9473A", -38, 6, -95); M(40, 4, 28, "#E8D9B0", -41, 11, -95);
  // loose bricks between the stations
  const PAL = [RED, TB, YEL, WH, GRN, ORG, NAVY];
  for (let i = 0; i < 70; i++) {
    const x = -95 + rnd() * 70, z = -40 + rnd() * 80, w = [2, 4, 2, 6][i % 4], d = [2, 2, 1, 2][i % 4];
    brick(x, 0, z, w, 1.2, d, PAL[i % 7]);
  }
  // a toy tub with bricks
  const tub = (x, z) => { M(16, 7, 1, RED, x, 0, z - 5); M(16, 7, 1, RED, x, 0, z + 5); M(1, 7, 10, RED, x - 7.5, 0, z); M(1, 7, 10, RED, x + 7.5, 0, z); M(14, 0.6, 9, RED, x, 0, z); for (let i = 0; i < 18; i++) brick(x - 6 + rnd() * 12, 0.6 + rnd() * 4.5, z - 3.5 + rnd() * 7, 2, 1.2, 2, PAL[i % 7]); };
  tub(-62, -36);

  // ======================= STATION Z: the zoo + parade podium =======================
  const PX = 6, PY = 4.0, PZ = -4;
  brick(9, 0, 3, 86, 0.4, 58, GRN); // x -34..52, z -26..32
  // parade lawn
  brick(33, 0.4, 0, 30, 0.2, 34, "#B8B8B0", false);
  for (let x = 19; x <= 47; x += 4) for (let z = -17; z <= 16; z += 4) ST.push([x + 0.5, 0.6, z + 0.5, "#B8B8B0"]);
  // pool: tiles, rim, island
  for (let x = -29; x < -5; x += 2) for (let z = -21; z < -5; z += 2) brick(x + 1, 0.4, z + 1, 2, 0.2, 2, ((x + z) / 2) % 3 === 0 ? "#3E9BE0" : "#2E86D2", false);
  for (let x = -30; x <= -5; x += 2) { brick(x + 0.5, 0.4, -21.5, 2, 1.2, 1, "#D9D3C4"); brick(x + 0.5, 0.4, -4.5, 2, 1.2, 1, "#D9D3C4"); }
  for (let z = -21; z <= -5; z += 2) { brick(-30.5, 0.4, z + 0.5, 1, 1.2, 2, "#D9D3C4"); brick(-4.5, 0.4, z + 0.5, 1, 1.2, 2, "#D9D3C4"); }
  brick(-15, 0.4, -13, 4, 1.2, 4, "#8E8A84"); brick(-15, 1.6, -13, 2, 1.2, 2, "#A39E95");
  // rocks behind the pool
  const rockTops = [];
  for (let x = -32; x < -2; x += 2.5) {
    const n = 1 + Math.floor(rnd() * 4), z = -23.6 + rnd() * 0.4;
    for (let k = 0; k < n; k++) brick(x + 1, 0.4 + k * 1.2, z, 3 - (k % 2), 1.2, 2, ["#8E8A84", "#9C978F", "#A9A49B", "#7E7A74"][(k + Math.floor(x)) & 3]);
    rockTops.push([x + 1, 0.4 + n * 1.2, z]);
  }
  // fence along the back
  for (let x = -33; x < 36; x += 4) { brick(x + 2, 0.4, -25.4, 4, 1.2, 1, (x / 4) % 2 ? "#F2EBDD" : "#E2D6BE"); brick(x + 2, 1.6, -25.4, 4, 1.2, 1, (x / 4) % 2 ? "#E2D6BE" : "#F2EBDD"); }
  // trees
  const tree = (x, z, s = 1) => { for (let k = 0; k < 4; k++) brick(x, 0.4 + k * 1.2, z, 2, 1.2, 2, "#7A4B2A"); const c = [[6, GRN], [6, "#4DB35A"], [4, GRN], [4, "#5CC266"], [2, "#4DB35A"]]; c.forEach(([w, col], k) => brick(x, 5.2 + k * 1.2, z, w * s, 1.2, w * s, col)); };
  tree(-30, 26); tree(49, -22); tree(49, 27); tree(-2, -22); tree(-22, 20);
  // podium: red, white, blue tiers
  brick(PX, 0.4, PZ, 10, 1.2, 8, RED); brick(PX, 1.6, PZ, 8, 1.2, 6, WH); brick(PX, 2.8, PZ, 6, 1.2, 4, NAVY);
  // flags beside the podium
  const flagTex = {
    no: canvasTex(352, 256, (g, w, h) => { const u = w / 22; g.fillStyle = RED; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(6 * u, 0, 4 * u, h); g.fillRect(0, 6 * u, w, 4 * u); g.fillStyle = NAVY; g.fillRect(7 * u, 0, 2 * u, h); g.fillRect(0, 7 * u, w, 2 * u); }),
    sc: canvasTex(320, 214, (g, w, h) => { g.fillStyle = "#005EB8"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 34; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); }),
  };
  const flags = [];
  const flag = (x, z, h, tx, w = 5.5, fh = 4) => {
    brick(x, 0.4, z, 2, 1.2, 2, "#9C978F");
    const pole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, h, 10), plast("#D8D8D8"))); pole.position.set(x, 1.6 + h / 2, z);
    stud(x, 1.6 + h, z, GOLD).scale.set(1.2, 1.5, 1.2);
    const geo = new THREE.PlaneGeometry(w, fh, 14, 6); geo.translate(w / 2, 0, 0);
    const m = add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.7 })));
    m.position.set(x + 0.2, 1.6 + h - fh / 2 - 0.2, z);
    flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), w, ph: rnd() * 6 });
    return m;
  };
  flag(PX - 7, PZ - 6, 11, flagTex.no); flag(PX + 8, PZ - 5, 11, flagTex.no);
  // zoo sign with the AUDIRA brick tile
  const signTx = label(1024, 360, (g, w, h) => {
    g.fillStyle = "#FFFDF7"; g.fillRect(0, 0, w, h); g.strokeStyle = GRN; g.lineWidth = 26; g.strokeRect(13, 13, w - 26, h - 26);
    g.fillStyle = GRN; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = F(800, 92); g.fillText("KEBUN BINATANG", w / 2, h * 0.36); g.fillStyle = NAVY; g.font = F(800, 120); g.fillText("EDINBURGH", w / 2, h * 0.7);
  });
  brick(15, 0.4, -22.5, 1, 7.2, 1, "#7A4B2A"); brick(27, 0.4, -22.5, 1, 7.2, 1, "#7A4B2A");
  tileMesh(13, 4.6, 0.6, signTx, WH, 21, 3.4, -22.1);
  const audTx = label(512, 160, (g, w, h) => {
    g.fillStyle = NAVY; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.fillRect(0, h - 18, w, 18);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(800, 96); g.fillText("AUDIRA", w / 2, h * 0.47);
  });
  tileMesh(6, 1.9, 0.5, audTx, NAVY, 21, 8.05, -22.1); // printed brick on top of the zoo sign
  // name plate in front of the podium: NILS / OLAV tiles snap on
  brick(PX - 3.2, 0.4, 1.4, 1, 1.2, 1, "#7A4B2A"); brick(PX + 3.2, 0.4, 1.4, 1, 1.2, 1, "#7A4B2A");
  M(7.6, 3.4, 0.6, WH, PX, 1.4, 1.4);
  const nameTile = (txt) => label(512, 128, (g, w, h) => { g.fillStyle = YEL; g.fillRect(0, 0, w, h); g.fillStyle = NAVY; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(800, 104); g.fillText(txt, w / 2, h * 0.56); });
  const nils = tileMesh(6.8, 1.4, 0.4, nameTile("NILS"), YEL, PX, 3.05, 1.85), olav = tileMesh(6.8, 1.4, 0.4, nameTile("OLAV"), YEL, PX, 1.55, 1.85);
  // generation numeral tile on the top podium tier
  const genC = document.createElement("canvas"); genC.width = 256; genC.height = 128;
  const genTx = new THREE.CanvasTexture(genC); genTx.colorSpace = THREE.SRGBColorSpace;
  let genTxt = "";
  const paintGen = (s) => { const g = genC.getContext("2d"); g.fillStyle = WH; g.fillRect(0, 0, 256, 128); g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(800, 104); g.fillText(s, 128, 72); genTx.needsUpdate = true; };
  const gen = tileMesh(2.6, 1.1, 0.3, genTx, WH, PX, 2.85, PZ + 2.12);
  // Guinness-style record plaque (generic, no logo) rises beside the podium
  const plTx = label(512, 384, (g, w, h) => {
    g.fillStyle = GOLD; g.fillRect(0, 0, w, h); g.strokeStyle = "#9A6A10"; g.lineWidth = 16; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#4A2E00"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = F(800, 54); g.fillText("REKOR DUNIA", w / 2, 86); g.font = F(800, 66); g.fillText("PENGUIN", w / 2, 178); g.fillText("BERPANGKAT", w / 2, 246); g.fillText("TERTINGGI", w / 2, 314);
  });
  const plaque = new THREE.Group(); scene.add(plaque); plaque.position.set(14.5, 0.4, -1.5);
  M(6, 0.6, 2, "#7A4B2A", 0, 0, 0, plaque); tileMesh(5.2, 3.9, 0.5, plTx, GOLD, 0, 0.6, 0.2, plaque).rotation.x = -0.12;

  // ======================= STATION T: 1961 Military Tattoo =======================
  const TX = -110;
  brick(TX, 0, 0, 56, 0.4, 50, "#BDB6A8");
  brick(TX, 0.4, 2, 10, 0.2, 46, "#9C978C", false);
  const stone = ["#8E8A84", "#9C978F", "#A9A49B"];
  for (let row = 0; row < 9; row++) for (let x = -28 + (row % 2) * 2; x < 28; x += 4) {
    const x0 = Math.max(-28, x), x1 = Math.min(28, x + 4), cx = (x0 + x1) / 2;
    if (row < 6 && cx > -5 && cx < 5) continue;
    brick(TX + cx, 0.4 + row * 1.2, -23, x1 - x0, 1.2, 2, stone[(row + Math.floor(x / 4)) % 3 & 3] || stone[0], row === 8);
  }
  for (let x = -27; x < 28; x += 4) brick(TX + x + 1, 11.2, -23, 2, 1.2, 2, stone[1]);
  M(10, 7.2, 1, "#2A2420", TX, 0.4, -24.3);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 13; k++) brick(TX + s * 15, 0.4 + k * 1.2, -23, 7, 1.2, 7, stone[k % 3], k === 12);
    for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) brick(TX + s * 15 + dx, 16, -23 + dz, 1, 1.2, 1, stone[0]);
  }
  const banTx = label(1024, 256, (g, w, h) => { g.fillStyle = RED; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(800, 70); g.fillText("EDINBURGH MILITARY TATTOO", w / 2, h * 0.36); g.font = F(800, 96); g.fillStyle = YEL; g.fillText("1961", w / 2, h * 0.72); });
  tileMesh(20, 5, 0.5, banTx, RED, TX, 5.4, -21.8).position.y = 9.6;
  flag(TX - 15, -23, 18, flagTex.no, 7, 5); flag(TX + 15, -23, 18, flagTex.sc, 7, 5);
  // grandstands, four tiers each side
  const seats = [];
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
    const x = TX + s * (17 + k * 2.2);
    brick(x, 0.4, 2, 2.2, 1.2 * (k + 1), 36, [RED, WH, NAVY, WH][k], false);
    for (let i = 0; i < 17; i++) seats.push([x, 0.4 + 1.2 * (k + 1), -14 + i * 2.05, s]);
  }
  // spectators: instanced bodies + heads
  const NS = seats.length;
  const spB = new THREE.InstancedMesh(boxG, white, NS), spH = new THREE.InstancedMesh(boxG, white, NS);
  for (const m of [spB, spH]) { m.castShadow = true; m.receiveShadow = true; scene.add(m); }
  const SPC = [RED, TB, YEL, GRN, ORG, "#7E57C2", WH, "#2B8C8C"], SKC = [PEACH, "#C98F64", "#F1C9A5", "#A86E4A"];
  seats.forEach((_, i) => { spB.setColorAt(i, new THREE.Color(SPC[(i * 7) % 8])); spH.setColorAt(i, new THREE.Color(SKC[(i * 3) % 4])); });

  // ---------- finalize static bricks ----------
  {
    const im = new THREE.InstancedMesh(boxG, white, BR.length), sm = new THREE.InstancedMesh(studG, white, ST.length);
    const m4 = new THREE.Matrix4(), qI = new THREE.Quaternion(), c = new THREE.Color();
    BR.forEach(([x, y, z, w, h, d, col], i) => { im.setMatrixAt(i, m4.compose(new V3(x, y, z), qI, new V3(w, h, d))); im.setColorAt(i, c.set(col)); });
    ST.forEach(([x, y, z, col], i) => { sm.setMatrixAt(i, m4.compose(new V3(x, y, z), qI, new V3(1, 1, 1))); sm.setColorAt(i, c.set(col)); });
    for (const m of [im, sm]) { m.castShadow = m.receiveShadow = true; scene.add(m); }
  }

  // ======================= penguins =======================
  function penguin(s = 1) {
    const G = new THREE.Group(), body = new THREE.Group(); G.add(body); G.scale.setScalar(s); scene.add(G);
    M(1.5, 0.4, 2.2, ORG, -0.9, 0, 0.6, body); M(1.5, 0.4, 2.2, ORG, 0.9, 0, 0.6, body);
    const L = [[0.4, 3.4, 2.8, WH], [1.6, 4.0, 3.2, WH], [2.8, 4.2, 3.2, WH], [4.0, 3.8, 3.0, "#FFF0C4"], [5.2, 3.0, 2.6, "#FFB020"]];
    for (const [y, w, d, fc] of L) { M(w, 1.2, d, BLK, 0, y, -0.2, body); M(w - 0.9, 1.2, 0.3, fc, 0, y, -0.2 + d / 2 + 0.12, body); }
    const head = new THREE.Group(); head.position.set(0, 6.4, -0.1); body.add(head);
    M(2.6, 2.0, 2.6, BLK, 0, 0, 0, head);
    for (const sx of [-1, 1]) { M(0.14, 1.0, 0.9, ORG, sx * 1.33, 0.3, -0.3, head); M(0.36, 0.36, 0.08, WH, sx * 0.62, 1.0, 1.32, head); M(0.18, 0.2, 0.06, "#111", sx * 0.62, 1.08, 1.38, head); }
    M(0.5, 0.45, 1.6, BLK, 0, 0.45, 2.05, head); M(0.52, 0.16, 1.3, ORG, 0, 0.45, 2.0, head);
    for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) stud(x, 2.0, z, BLK, head);
    const fl = [-1, 1].map((sx) => { const p = new THREE.Group(); p.position.set(sx * 2.25, 5.2, -0.2); body.add(p); M(1.1, 3.6, 0.5, BLK, sx * 0.4, -3.6, 0, p); return p; });
    return { G, body, head, fl };
  }
  const hero = penguin(1);
  hero.G.position.set(PX, PY, PZ);
  // insignia: [parent, build, target pos, fly-in offset, anchor]
  const ins = [];
  const insig = (parent, at, x, y, z, off, build) => { const g = new THREE.Group(); parent.add(g); build(g); ins.push({ g, base: new V3(x, y, z), off, at }); return g; };
  const chevron = (g) => { for (const s of [-1, 1]) { const m = M(0.62, 0.22, 0.14, GOLD, s * 0.24, -0.11, 0, g); m.rotation.z = s * 0.6; } };
  const FR = hero.fl[1];
  insig(FR, "s4:kopral", 0.4, -1.3, 0.3, [3, 3, 6], chevron);
  insig(FR, "s5:Kopral", 0.4, -1.75, 0.3, [3, 3, 6], chevron);
  insig(FR, "s5:sersan", 0.4, -2.2, 0.3, [3, 3, 6], chevron);
  insig(FR, "s5:sersan#2", 0.4, -0.75, 0.3, [3, 4, 6], (g) => { M(0.8, 0.22, 0.14, YEL, 0, -0.2, 0, g); for (const x of [-0.3, 0, 0.3]) M(0.18, 0.3, 0.14, YEL, x, 0, 0, g); });
  for (const f of hero.fl) insig(f, "s6:kolonel", f === FR ? 0.4 : -0.4, 0.05, 0, [0, 6, 4], (g) => { M(1.5, 0.3, 1.2, GOLD, 0, 0, 0, g); for (let k = 0; k < 4; k++) M(0.14, 0.5, 0.14, GOLD, -0.55 + k * 0.37, -0.45, 0.55, g); });
  insig(hero.body, "s6:kolonel", 0, 3.4, 1.62, [-6, 4, 6], (g) => { const m = M(5.2, 0.9, 0.22, RED, 0, -0.45, 0, g); m.rotation.z = 0.62; const e = M(5.2, 0.18, 0.24, NAVY, 0, 0.15, 0.01, g); e.rotation.z = 0.62; });
  const star = (r1, r2, col, d = 0.14) => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r2 : r1; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } const ge = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }); return add(new THREE.Mesh(ge, plast(col))); };
  insig(hero.body, "s6:ksatria", -0.9, 4.2, 1.72, [-4, 5, 7], (g) => { M(0.42, 0.7, 0.1, NAVY, 0, 0.35, 0, g); M(0.2, 0.7, 0.12, RED, 0, 0.35, 0.01, g); const s = star(0.5, 0.22, GOLD); s.position.set(0, 0.05, 0); g.add(s); });
  insig(hero.body, "s7:brigadir", 0, 6.05, 1.36, [4, 5, 7], (g) => { M(2.3, 0.4, 0.2, GOLD, 0, -0.2, 0, g); const s = star(0.26, 0.11, "#F4F4F4"); s.position.set(-0.6, 0, 0.1); g.add(s); });
  insig(hero.body, "s7:jenderal", 0.6, 6.05, 1.46, [4, 5, 7], (g) => { const s = star(0.26, 0.11, "#F4F4F4"); g.add(s); });
  insig(hero.head, "s7:jenderal", 0, 2.05, -0.1, [0, 9, 2], (g) => { M(2.9, 0.9, 2.9, NAVY, 0, 0, 0, g); M(2.94, 0.3, 2.94, RED, 0, 0.1, 0, g); M(2.2, 0.16, 1.2, "#111", 0, 0.02, 1.9, g); M(0.6, 0.6, 0.1, GOLD, 0, 0.25, 1.48, g); for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) stud(x, 0.9, z, NAVY, g); });
  // colony
  const colony = [];
  const cpos = [[-27, 0.4, -2.6, 0.3], [-24.5, 0.4, -2.4, -0.2], [-9, 0.4, -2.7, 0.1], [-2.8, 0.4, -9, -0.9], [-15, 2.8, -13, 0.4], [rockTops[2][0], rockTops[2][1], rockTops[2][2], 0.2], [rockTops[8][0], rockTops[8][1], rockTops[8][2], -0.3]];
  for (const [x, y, z, ry] of cpos) { const p = penguin(0.48); p.G.position.set(x, y, z); p.G.rotation.y = ry; colony.push({ p, x, y, z, ry }); }
  const swim = penguin(0.42);

  // ======================= guards (instanced, jointed) =======================
  const NG = 161; // 130 parade (13 x 10), 30 tattoo platoon + 1 lieutenant
  const PARTS = [];
  const DEF = [
    [[0.9, 0.5, 1.2], "#111", 0.5, 0.0, 0.1, 1], [[0.9, 0.5, 1.2], "#111", -0.5, 0.0, 0.1, 2],
    [[0.85, 2.0, 0.95], UNI, 0.5, 0.5, 0, 1], [[0.85, 2.0, 0.95], UNI, -0.5, 0.5, 0, 2],
    [[2.0, 0.5, 1.0], UNI, 0, 2.5, 0, 0], [[2.1, 2.0, 1.1], UNI, 0, 3.0, 0, 0], [[2.16, 0.28, 1.16], "#F4F4F0", 0, 3.1, 0, 0],
    [[0.28, 2.3, 1.16], "#F4F4F0", 0, 2.95, 0, 0, 0.6], [[1.3, 0.22, 1.15], RED, 0, 4.88, 0, 0],
    [[0.6, 1.9, 0.8], UNI, -1.38, 2.95, 0, 3], [[0.55, 0.5, 0.6], PEACH, -1.38, 2.5, 0, 3],
    [[0.6, 1.9, 0.8], UNI, 1.38, 2.95, 0, 0], [[0.55, 0.5, 0.6], PEACH, 1.38, 2.5, 0.1, 0, 0, "rh"],
    [[1.15, 1.15, 1.1], PEACH, 0, 5.1, 0, 0], [["cyl", 0.62, 0.66, 0.95], "#121318", 0, 6.2, 0, 0], [["cyl", 0.98, 0.98, 0.12], "#121318", 0, 6.15, 0, 0],
    [["sph", 0.42], "#262830", -0.6, 6.7, 0, 0, 0.4, "pl"], [[0.32, 0.32, 0.06], GOLD, 0, 6.45, 0.66, 0],
    [[0.2, 3.4, 0.25], "#5A3A22", 1.85, 2.6, 0.3, 0, 0, "rf"], [[0.08, 0.9, 0.12], "#D8D8D8", 1.85, 6.0, 0.3, 0, 0, "rf"],
  ];
  const mkGeo = (sp) => sp[0] === "cyl" ? new THREE.CylinderGeometry(sp[1], sp[2], sp[3], 14) : sp[0] === "sph" ? new THREE.SphereGeometry(sp[1], 12, 10) : new THREE.BoxGeometry(sp[0] - 0.03, sp[1] - 0.03, sp[2] - 0.03);
  for (const [sp, col, x, y, z, limb, rz = 0, tagp] of DEF) {
    const geo = mkGeo(sp), h = sp[0] === "cyl" ? sp[3] : sp[0] === "sph" ? 0 : sp[1];
    const L = new THREE.Matrix4().compose(new V3(x, y + h / 2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)), tagp === "pl" ? new V3(0.7, 1.5, 0.7) : new V3(1, 1, 1));
    const mesh = new THREE.InstancedMesh(geo, plast(col), NG); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; scene.add(mesh);
    PARTS.push({ mesh, L, limb, geo, col, tagp });
  }
  const Mb = new THREE.Matrix4(), Ml = new THREE.Matrix4(), Mt = new THREE.Matrix4(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0), qq = new THREE.Quaternion(), ee = new THREE.Euler(), vv = new V3(), sv = new V3();
  const limbM = (a, py) => Ml.makeRotationX(a).setPosition(0, py * (1 - Math.cos(a)), -py * Math.sin(a));
  function placeGuard(i, x, y, z, yaw, sw, s = 1) {
    if (s <= 0.001) { for (const p of PARTS) p.mesh.setMatrixAt(i, ZERO); return; }
    Mb.compose(vv.set(x, y, z), qq.setFromEuler(ee.set(0, yaw, 0)), sv.set(s, s, s));
    for (const p of PARTS) {
      if (p.limb) { const a = p.limb === 1 ? sw : p.limb === 2 ? -sw : -sw * 0.8; Mt.multiplyMatrices(Mb, limbM(a, p.limb < 3 ? 2.5 : 4.85)).multiply(p.L); }
      else Mt.multiplyMatrices(Mb, p.L);
      p.mesh.setMatrixAt(i, Mt);
    }
  }
  // the officer who taps the sword: a non-instanced guard with a pivoting sword arm
  const officer = new THREE.Group(); scene.add(officer);
  const armP = new THREE.Group(); armP.position.set(1.38, 4.85, 0); armP.rotation.order = "YXZ"; officer.add(armP);
  for (const p of PARTS) {
    if (p.tagp === "rf") continue;
    const m = add(new THREE.Mesh(p.geo, plast(p.col))); m.applyMatrix4(p.L);
    if (p.L.elements[12] > 1 && p.L.elements[13] < 4.9 && p.L.elements[13] > 2) { m.position.sub(armP.position); armP.add(m); } else officer.add(m);
  }
  for (const s of [-1, 1]) M(1.0, 0.25, 1.1, GOLD, s * 1.2, 4.88, 0, officer);
  M(0.4, 0.2, 0.9, GOLD, 0, -2.6, 0, armP); M(0.16, 5.2, 0.34, "#E4E6EA", 0, -7.8, 0, armP);
  officer.position.set(PX - 11, 0.4, PZ + 1.5); officer.rotation.y = Math.PI / 2 - 0.12;
  // lieutenant marker at the Tattoo
  const marker = new THREE.Group(); scene.add(marker);
  const cone = add(new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 4), plast(YEL))); cone.rotation.x = Math.PI; marker.add(cone);
  M(0.8, 1.2, 0.8, YEL, 0, 0.8, 0, marker);

  // ---------- timing ----------
  const cK = A("s3:pada"), c1 = A("s3:Ceritanya"), c2 = A("s4:Tahun"), c3 = A("s6:Tahun"), c4 = A("s8:Tradisi");
  const tGarda = A("s3:Garda"), swap1 = A("s5:penggantinya"), swap2 = A("s7:ketiga") + 0.1, march08 = A("s6:2008");
  const zHead = (t) => Math.min(12, -21 + 3.6 * Math.max(0, t - (tGarda - 0.6)));
  const lift = (t, tc) => { if (t < tc - 0.5 || t > tc + 0.7) return 0; if (t < tc) return 34 * Math.pow(clamp01((t - tc + 0.5) / 0.5), 3); return 34 * (1 - back(clamp01((t - tc - 0.05) / 0.55), 1.2)); };

  // ---------- camera ----------
  const eg = (t) => [TX, zHead(t)];
  const keys = [
    [0, 14, 11, 27, PX, 9.4, PZ], [A("s1:jenderal"), 10.5, 10, 22, PX, 9.4, PZ], [K.s1e, 8.5, 9.8, 19.5, PX, 9.5, PZ],
    [A("s2:Olav") + 0.3, 2, 13, 27, PX - 1, 8, PZ - 1],
    [A("s2:Edinburgh") + 0.4, -10, 32, 54, -6, 2, -8], [A("s2:Garda") + 0.2, 40, 24, 50, 28, 3, 0], [c1 - 0.02, 44, 23, 47, 29, 3, 0],
    [c1, TX + 14, 30, 58, TX, 6, -6], [A("s3:1961") + 0.6, TX + 9, 28, 54, TX, 6, -8], [tGarda + 0.3, TX + 5, 22, 46, TX, 5, -10],
    [A("s3:militer"), TX - 12, 17, 36, TX, 4, -4],
    [A("s3:letnan"), TX + 7, 12, eg(A("s3:letnan"))[1] + 23, TX, 7, eg(A("s3:letnan"))[1]],
    [A("s3:Egelien") - 0.3, TX + 6, 11.5, eg(A("s3:Egelien"))[1] + 22, TX, 7, eg(A("s3:Egelien"))[1]], [cK - 0.02, TX + 5.5, 11.5, eg(cK)[1] + 21, TX, 7, eg(cK)[1]],
    [cK, -9, 12, 12, -17, 2.6, -15],
    [A("s3:koloni") + 0.7, -11, 11, 9, -17, 2.6, -16], [c2 - 0.02, -12, 10.5, 7.5, -17, 2.6, -16],
    [c2, 26, 21, 46, PX, 5, -2], [A("s4:1972") + 0.6, 22, 19, 42, PX, 5, -2], [A("s4:mengadopsi"), 13, 13, 29, PX, 7, PZ],
    [A("s4:Namanya") + 0.2, 9, 10, 30, PX, 5.5, -1], [A("s4:Siggerud"), 8, 9.5, 28, PX, 5.2, -1], [A("s4:kopral") - 0.4, PX + 5, 11, PZ + 31, PX + 0.5, 7.7, PZ],
    [c2 + 13.2, PX + 6, 11, PZ + 31, PX + 0.5, 7.7, PZ],
    [A("s5:naik"), PX + 7, 12.5, PZ + 31, PX + 0.3, 9.2, PZ], [A("s5:sersan#2") + 0.5, PX + 5, 12.5, PZ + 31, PX + 0.5, 9.3, PZ],
    [A("s5:Saat") - 0.3, PX - 2, 13, PZ + 33, PX, 8.5, PZ + 1], [swap1 + 0.4, PX - 2.5, 13.5, PZ + 34, PX, 8.5, PZ + 1], [A("s5:meneruskan") + 0.8, PX, 11, PZ + 32, PX, 7.7, PZ], [c3 - 0.02, PX + 0.5, 11, PZ + 32, PX, 7.7, PZ],
    [c3, PX - 7, 11, PZ + 30, PX, 7.7, PZ], [A("s6:kolonel") + 0.4, PX - 4, 11, PZ + 31, PX, 7.7, PZ], [A("s6:Tahun#2"), PX - 2, 12, PZ + 32, PX, 7.7, PZ],
    [march08 + 0.9, 66, 22, 40, 44, 3, 0], [A("s6:Harald"), 54, 20, 40, 33, 4, -1],
    [A("s6:dianugerahi") - 0.4, -22.4, 27, 27.3, 0.5, 5.5, -3.2], [A("s6:ksatria") + 0.3, -21.4, 26.5, 26.8, 1, 5.5, -3.2],
    [A("s6:130") - 0.1, 22, 38, 62, 24, 2, 0], [K.s7, 20, 40, 64, 23, 2, 0],
    [K.s7 + 1.6, 6, 13, 30, PX, 8.2, PZ + 1], [A("s7:tradisinya") + 0.6, 5, 12, 27, PX, 7.8, PZ + 1],
    [A("s7:brigadir") + 0.3, PX + 4, 13, PZ + 30, PX, 9.4, PZ], [A("s7:jenderal") + 0.5, PX + 3, 13.5, PZ + 31, PX, 9.8, PZ],
    [A("s7:Guinness") + 0.4, 17, 8, 21, 12.5, 2.6, -1.5], [A("s7:tertinggi") + 0.3, 18, 7.5, 19.5, 13, 2.4, -1.5],
    [A("s7:Pangkatnya") + 0.3, 9, 4.5, 17, PX, 9.8, PZ], [c4 - 0.02, 10, 4.8, 16, PX, 9.9, PZ],
    [c4, -16, 30, 56, 12, 4, -2], [A("s8:Menurut"), -22, 40, 70, 12, 3, -2], [K.end, -26, 50, 84, 12, 2, -2], [K.dur, -27, 52, 86, 12, 2, -2],
  ];
  const camT = track(keys);
  const tgt = new V3();

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check(F(800, 40)) && document.fonts.check("700 30px 'Nunito Sans'")) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } genTxt = ""; }
    const tq = Math.floor(t * 15) / 15; // toy parts on twos
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.3, c[1] + Math.sin(t * 0.29) * 0.2, c[2] + Math.cos(t * 0.31) * 0.25);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.position.set(tgt.x - 45, 80, tgt.z + 55); key.target.position.copy(tgt);
    const atT = t >= c1 && t < c2;

    // flags
    for (const f of flags) { const pa = f.geo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = f.base[i * 3], y = f.base[i * 3 + 1]; pa.setZ(i, Math.sin(x * 0.9 - tq * 4.5 + y * 0.25 + f.ph) * 0.3 * (x / f.w)); } pa.needsUpdate = true; f.geo.computeVertexNormals(); }

    // hero penguin
    const heroOn = !atT;
    hero.G.visible = heroOn;
    const ly = lift(tq, swap1) + lift(tq, swap2);
    hero.G.position.y = PY + ly;
    hero.body.rotation.z = Math.sin(tq * 3) * 0.02;
    hero.head.rotation.y = Math.sin(tq * 0.9) * 0.25;
    let twitch = 0;
    for (const s of ins) { const d = tq - A(s.at); if (d > -0.05 && d < 0.5) twitch = Math.max(twitch, Math.sin(clamp01(d / 0.5) * Math.PI)); }
    hero.fl[0].rotation.z = -0.12 - 0.05 * Math.sin(tq * 2.2);
    hero.fl[1].rotation.z = 0.12 + 0.05 * Math.sin(tq * 2.2 + 1) + 0.35 * twitch;
    // insignia: all on during the present-day intro; then each snaps on at its word
    for (const s of ins) {
      const t0 = A(s.at);
      if (t < c1) { s.g.visible = true; s.g.position.copy(s.base); s.g.scale.setScalar(1); continue; }
      const u = (tq - (t0 - 0.45)) / 0.45;
      if (u < 0) { s.g.visible = false; continue; }
      s.g.visible = true;
      const k = clamp01(u), e = eout(k);
      s.g.position.set(s.base.x + s.off[0] * (1 - e), s.base.y + s.off[1] * (1 - e) + Math.sin(k * Math.PI) * 1.2, s.base.z + s.off[2] * (1 - e));
      const d = tq - t0;
      s.g.scale.setScalar(d < 0 ? 0.85 + 0.15 * k : 1 + 0.2 * Math.exp(-d * 9) * Math.cos(d * 34));
    }
    // name tiles and generation numeral
    const snapIn = (m, a, sy = 1) => { if (t < c1) { m.visible = true; m.scale.y = sy; return; } const d = tq - a; m.visible = d >= -0.2; m.scale.y = sy * (d < 0 ? 0.3 : 1 + 0.25 * Math.exp(-d * 9) * Math.cos(d * 34)); };
    snapIn(nils, A("s4:Nils#2"), 1.4); snapIn(olav, A("s4:Olav#2"), 1.4);
    const gtxt = t < c1 ? "III" : t < swap1 ? "I" : t < swap2 ? "II" : "III";
    if (gtxt !== genTxt) { genTxt = gtxt; paintGen(gtxt); }
    gen.visible = !atT && (t < c1 || t >= A("s4:Namanya"));
    // plaque rises
    const pu = t < c1 || t >= c4 ? 1 : back(clamp01((tq - A("s7:Guinness") + 0.2) / 0.5), 1.4);
    plaque.visible = pu > 0.001 && !atT; plaque.scale.set(1, Math.max(0.001, pu), 1);
    // colony + swimmer
    colony.forEach((cp, i) => { cp.p.G.visible = true; cp.p.G.rotation.y = cp.ry + Math.sin(tq * 0.8 + i * 2) * 0.35; cp.p.G.position.y = cp.y + Math.abs(Math.sin(tq * 2 + i)) * 0.08; cp.p.fl[0].rotation.z = -0.15 - 0.2 * Math.max(0, Math.sin(tq * 3 + i)); cp.p.fl[1].rotation.z = 0.15 + 0.2 * Math.max(0, Math.sin(tq * 3 + i + 1)); });
    { const a = tq * 0.45; swim.G.position.set(-17 + Math.cos(a) * 8, 0.2, -13 + Math.sin(a) * 5.5); swim.G.rotation.set(-1.25, -a + Math.PI, 0, "YXZ"); }

    // parade guards
    const sw = (ph) => Math.sin(ph) * 0.55;
    for (let i = 0; i < 130; i++) {
      const rr = Math.floor(i / 13), cc = i % 13, sx = 21 + rr * 2.6, sz = -14.5 + cc * 2.4;
      let show = 0, x = sx, z = sz, yaw = -Math.PI / 2, s = 0, y = 0.6;
      if (t < c1 || t >= K.s7) show = 1;
      else if (t >= c2 && rr < 2) show = 1;
      else if (t >= march08 - 0.3 && t >= c3 && rr >= 2) {
        const a = march08 + (rr - 2) * 0.42, u = clamp01((tq - a) / 2.6);
        if (tq >= a - 0.3) {
          show = 1; x = sx + 30 * (1 - u);
          if (u < 1) { yaw = -Math.PI / 2; y += Math.abs(Math.sin(tq * 11 + cc)) * 0.15; placeGuard(i, x, y, z, yaw, sw(tq * 11 + cc * 0.1), 1); continue; }
        }
      }
      s = show;
      placeGuard(i, x, y, z, yaw, 0, s);
    }
    // tattoo platoon + lieutenant
    for (let i = 130; i < NG; i++) {
      if (!atT) { placeGuard(i, 0, 0, 0, 0, 0, 0); continue; }
      const j = i - 130, lead = j === 30, rk = lead ? -1 : Math.floor(j / 3), lane = lead ? 0 : (j % 3) - 1;
      const z = zHead(tq) - 2.6 - rk * 2.4, moving = tq > tGarda - 0.6 && zHead(tq) < 12;
      if (z < -21.5) { placeGuard(i, 0, 0, 0, 0, 0, 0); continue; }
      placeGuard(i, TX + lane * 2.7, 0.6 + (moving ? Math.abs(Math.sin(tq * 11)) * 0.15 : 0), z, 0, moving ? sw(tq * 11) : 0, lead ? 1.08 : 1);
    }
    for (const p of PARTS) p.mesh.instanceMatrix.needsUpdate = true;
    marker.visible = atT && t >= A("s3:letnan") - 0.1;
    marker.position.set(TX, 9.6 + Math.abs(Math.sin(tq * 5)) * 0.8, zHead(tq) - 2.6 + 2.4);
    // spectators cheer while the platoon marches
    const cheer = atT ? ramp(t, tGarda - 0.5, tGarda + 0.5) : 0;
    seats.forEach(([x, y, z, sd], i) => {
      const b = cheer * Math.max(0, Math.sin(tq * 9 + i * 1.7)) * 0.45;
      Mb.compose(vv.set(x, y + 0.8 + b, z), qq.setFromEuler(ee.set(0, -sd * Math.PI / 2, 0)), sv.set(1.6, 1.6, 1.0)); spB.setMatrixAt(i, Mb);
      Mb.compose(vv.set(x, y + 2.15 + b, z), qq, sv.set(0.9, 0.9, 0.9)); spH.setMatrixAt(i, Mb);
    });
    spB.instanceMatrix.needsUpdate = spH.instanceMatrix.needsUpdate = true;

    // the sword ceremony
    const ofOn = t >= A("s6:dengan") - 0.2 && t < K.s7;
    officer.visible = ofOn;
    if (ofOn) {
      const d0 = A("s6:dianugerahi");
      const kk = [[d0 - 1, -2.95, 0], [d0 - 0.1, -2.95, 0], [d0 + 0.35, -2.0, 0.16], [d0 + 0.65, -2.5, 0], [d0 + 0.95, -2.0, -0.16], [d0 + 1.5, -2.95, 0]];
      let ax = kk[0][1], ay = 0;
      for (let i = 0; i < kk.length - 1; i++) if (tq >= kk[i][0] && tq < kk[i + 1][0]) { const u = eout((tq - kk[i][0]) / (kk[i + 1][0] - kk[i][0])); ax = kk[i][1] + (kk[i + 1][1] - kk[i][1]) * u; ay = kk[i][2] + (kk[i + 1][2] - kk[i][2]) * u; }
      if (tq >= kk[kk.length - 1][0]) ax = kk[kk.length - 1][1];
      armP.rotation.set(ax, ay, 0);
      officer.scale.setScalar(back(clamp01((tq - A("s6:dengan") + 0.2) / 0.35)) || 0.001);
    }

    tiltH.uniforms.amt.value = tiltV.uniforms.amt.value = 0.8;
    comp.render();
  };
}
