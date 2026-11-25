// EP19 ISOCRAFT: an isometric comic teardown of the Swiss shelter system. Flat toon shading, thick ink lines from a
// depth + normal edge pass, cool concrete greys, Swiss red accents, low-poly Alps. Four stations far apart on one world:
// H  a diorama strip of chalets cut open along the front face; the main bunker (blast door, bunks, air filter, water)
//    sits under the AUDIRA chalet, smaller bunkers under the neighbours, the 1978 blast-ring schematic behind them,
// L  a Cold War desk: the 1963 law scroll unrolls, a rubber stamp lands, a model chalet + bunker, a wall map,
// T  a mountain sliced open along the Sonnenberg tunnel: stock shelves, fuel drums, bunks, a month calendar,
// P  a counter board: 114 places, 100 people icons (1 icon = 1% of the population), then Swiss vs German bars.
// Stations change under the HTML panel slide-apart. Everything is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, eout, clamp01, canvasTex, stage, back } from "./lib3d.js";
import { CH } from "./swiss.js";

const RED = "#DA291C", INK = "#1C1E21", PAPER = "#F5F2EB", CON = "#B9BEC2", CON2 = "#A3A9AE", CON3 = "#8C9399", STEEL = "#D1D8E0";
const BLUE = "#7A9BB8", YEL = "#F4C430", MINT = "#5FA084", WOOD = "#B5793F", ROOF = "#5A3B2A", EARTH = "#9C7652", GRASS = "#7FB069";
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

// Ink: Laplacian of inverse depth (silhouettes) + normal creases + alpha edges, drawn before bloom.
const INKPASS = {
  uniforms: { tDiffuse: { value: null }, tN: { value: null }, tD: { value: null }, px: { value: new THREE.Vector2(1 / 1080, 1 / 1920) }, near: { value: 1 }, far: { value: 1200 }, w: { value: 1.6 }, ink: { value: new THREE.Color(0x1c1e21) }, amt: { value: 0.95 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `uniform sampler2D tDiffuse,tN,tD;uniform vec2 px;uniform float near,far,w,amt;uniform vec3 ink;varying vec2 vUv;
float iz(vec2 uv){float d=texture2D(tD,uv).x;float z=d*2.-1.;return (far+near-z*(far-near))/(2.*near*far);}
void main(){vec4 c=texture2D(tDiffuse,vUv);vec4 n0=texture2D(tN,vUv);float w0=iz(vUv);float e=0.;
vec2 D[4];D[0]=vec2(1.,0.);D[1]=vec2(0.,1.);D[2]=vec2(.707,.707);D[3]=vec2(.707,-.707);
for(int i=0;i<4;i++){vec2 o=D[i]*px*w;float wa=iz(vUv+o),wb=iz(vUv-o);float lap=abs(wa+wb-2.*w0)/max(w0,1e-5);e=max(e,smoothstep(.012,.03,lap));
vec4 na=texture2D(tN,vUv+o),nb=texture2D(tN,vUv-o);e=max(e,max(abs(na.a-n0.a),abs(nb.a-n0.a)));
if(n0.a>.5&&na.a>.5){float k=1.-dot(normalize(n0.xyz*2.-1.),normalize(na.xyz*2.-1.));e=max(e,smoothstep(.18,.38,k));}}
gl_FragColor=vec4(mix(c.rgb,ink,clamp(e,0.,1.)*amt),c.a);}`,
};

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xdfe6ea, fog: 0.0015, exp: 0.82, bloom: [0.06, 0.3, 0.97] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.82;
  cam.near = 1; cam.far = 1200; cam.updateProjectionMatrix();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  // ink pre-pass target
  const rtN = new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType });
  rtN.depthTexture = new THREE.DepthTexture(1080, 1920); rtN.depthTexture.type = THREE.UnsignedIntType;
  const nMat = new THREE.MeshNormalMaterial();
  const inkP = new ShaderPass(INKPASS);
  inkP.uniforms.tN.value = rtN.texture; inkP.uniforms.tD.value = rtN.depthTexture;
  comp.insertPass(inkP, 1);
  const noInk = [];

  // sky dome: vertical gradient, tinted per beat
  const skyU = { top: { value: new THREE.Color(0x9fc3dc) }, bot: { value: new THREE.Color(0xeef1ee) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,bot;varying vec3 vP;void main(){float h=clamp(normalize(vP).y*2.2+.12,0.,1.);gl_FragColor=vec4(mix(bot,top,h),1.);}" }));
  scene.add(sky); noInk.push(sky);

  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x8a8478, 1.1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff4e2, 2.6);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 400 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.04;
  scene.add(key, key.target);

  // ---------- materials ----------
  const grad = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toonC = {};
  const toon = (c, extra = {}) => { const k = c + JSON.stringify(Object.keys(extra)); return toonC[k] || (toonC[k] = new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); };
  const metal = (c, rough = 0.38) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.75, envMapIntensity: 0.25 });
  const plastic = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0, envMapIntensity: 0.25 });
  const boxG = new THREE.BoxGeometry(1, 1, 1);
  const add = (m, p = scene) => { m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  // box by min corner + size, in a parent
  const B = (x0, y0, z0, w, h, d, mat, p) => { const m = new THREE.Mesh(boxG, typeof mat === "string" ? toon(mat) : mat); m.scale.set(w, h, d); m.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2); return add(m, p); };
  const C = (x, y, z, rt, rb, h, mat, p, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof mat === "string" ? toon(mat) : mat); m.position.set(x, y + h / 2, z); return add(m, p); };

  // canvas labels repainted once web fonts are ready
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  let fontsOk = false;
  const F = (px) => `${px}px Bangers, 'Luckiest Guy', Impact, sans-serif`;
  const FI = (wt, px) => `${wt} ${px}px Inter, Arial, sans-serif`;
  try { document.fonts.load(F(40)); document.fonts.load(FI(800, 40)); } catch (e) { /* no font api */ }
  const decal = (w, h, tx, x, y, z, p = scene, ry = 0, transparent = true) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, transparent, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m;
  };
  const texRep = (base, w, h, s) => { const t = base.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / s, h / s); return t; };

  // shared textures
  const earthT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = EARTH; g.fillRect(0, 0, w, h);
    const q = mulberry(63);
    const bands = ["#A9835D", "#8E6A48", "#B08B63", "#7F5E40"];
    for (let k = 0; k < 6; k++) { g.fillStyle = bands[k % 4]; g.beginPath(); g.moveTo(0, k * 86); for (let x = 0; x <= w; x += 32) g.lineTo(x, k * 86 + Math.sin(x * 0.02 + k) * 9); g.lineTo(w, k * 86 + 60); g.lineTo(0, k * 86 + 60); g.fill(); }
    g.strokeStyle = "rgba(28,30,33,.55)"; g.lineWidth = 4;
    for (let k = 0; k < 6; k++) { g.beginPath(); for (let x = 0; x <= w; x += 32) g.lineTo(x, k * 86 + Math.sin(x * 0.02 + k) * 9); g.stroke(); }
    for (let i = 0; i < 70; i++) { g.fillStyle = q() < 0.5 ? "#6E5038" : "#C9A57A"; g.strokeStyle = INK; g.lineWidth = 3; const x = q() * w, y = q() * h, rr = 4 + q() * 9; g.beginPath(); g.ellipse(x, y, rr * 1.4, rr, q() * 3, 0, 7); g.fill(); g.stroke(); }
  });
  earthT.wrapS = earthT.wrapT = THREE.RepeatWrapping;
  const concT = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = CON; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(28,30,33,.28)"; g.lineWidth = 3;
    for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = "rgba(28,30,33,.3)"; for (let y = 32; y < h; y += 64) for (let x = 32; x < w; x += 128) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
  });
  concT.wrapS = concT.wrapT = THREE.RepeatWrapping;
  const plankT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = WOOD; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(28,30,33,.6)"; g.lineWidth = 4; for (let y = 0; y <= h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = "rgba(255,230,190,.25)"; g.lineWidth = 2; for (let y = 10; y <= h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping;
  const earthBox = (x0, y0, z0, w, h, d) => {
    const top = toon(GRASS), side = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, map: texRep(earthT, d, h, 14) }), frontM = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, map: texRep(earthT, w, h, 14) });
    const sd = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, map: texRep(earthT, d, h, 14) });
    const m = new THREE.Mesh(boxG, [sd, sd, top, side, frontM, side]); m.scale.set(w, h, d); m.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2); return add(m);
  };
  const concMat = (w, h) => new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, map: texRep(concT, w, h, 4) });

  const rnd = mulberry(1963);
  // low-poly faceted mountain with snow cap
  const mountain = (x, z, h, rad, seg = 6, p = scene) => {
    const g = new THREE.ConeGeometry(rad, h, seg, 3).toNonIndexed();
    const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); if (y < h / 2 - 0.1 && y > -h / 2 + 0.1) { const k = 1 + (Math.sin(pa.getX(i) * 0.7 + pa.getZ(i) * 1.3 + x) * 0.12); pa.setX(i, pa.getX(i) * k); pa.setZ(i, pa.getZ(i) * k); } }
    g.computeVertexNormals();
    const m = add(new THREE.Mesh(g, toon("#7F95AD")), p); m.position.set(x, h / 2 - 1, z); m.rotation.y = x * 0.37; m.castShadow = false;
    const sg = new THREE.ConeGeometry(rad * 0.36, h * 0.36, seg, 1).toNonIndexed(); sg.computeVertexNormals();
    const s = add(new THREE.Mesh(sg, toon("#F7F9FB")), p); s.position.set(x, h - 1 - h * 0.18 + 0.15, z); s.rotation.y = m.rotation.y; s.scale.set(1.04, 1, 1.04); s.castShadow = false;
    return m;
  };
  const pine = (x, y, z, s = 1, p = scene) => { C(x, y, z, 0.35 * s, 0.45 * s, 1.6 * s, "#6B4A2E", p, 6); for (let k = 0; k < 3; k++) { const c = add(new THREE.Mesh(new THREE.ConeGeometry((2.2 - k * 0.55) * s, 2.6 * s, 7), toon(k % 2 ? "#3F7D58" : "#356B4B")), p); c.position.set(x, y + (2.4 + k * 1.5) * s, z); } };
  const flagTx = canvasTex(256, 256, (g, w, h) => { g.fillStyle = RED; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(w * 0.406, h * 0.19, w * 0.188, h * 0.62); g.fillRect(w * 0.19, h * 0.406, w * 0.62, h * 0.188); });
  const flags = [];
  const flagPole = (x, y, z, hgt, fs, p = scene) => {
    C(x, y, z, 0.16, 0.2, hgt, STEEL, p, 10); C(x, y + hgt, z, 0.3, 0.3, 0.3, YEL, p, 10);
    const geo = new THREE.PlaneGeometry(fs, fs, 10, 6); geo.translate(fs / 2, 0, 0);
    const m = add(new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: flagTx, gradientMap: grad, side: THREE.DoubleSide })), p);
    m.position.set(x + 0.15, y + hgt - fs / 2 - 0.1, z);
    flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), w: fs, ph: rnd() * 6 });
    return m;
  };

  // ---------- people icons (instanced pawns, no faces) ----------
  const pawnSets = [];
  const pawns = (n, cols) => {
    const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.42, 0.75, 4, 10), toon("#ffffff"), n);
    const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.4, 14, 10), toon("#ffffff"), n);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) { body.setColorAt(i, c.set(cols[i % cols.length])); head.setColorAt(i, c.set("#F3D9C2")); }
    for (const m of [body, head]) { m.castShadow = true; m.frustumCulled = false; scene.add(m); }
    const s = { n, body, head, set(i, x, y, z, k) { const kk = Math.max(0.0001, k); M4.compose(vv.set(x, y + 0.8 * kk, z), qI, sv.set(kk, kk, kk)); body.setMatrixAt(i, M4); M4.compose(vv.set(x, y + 1.85 * kk, z), qI, sv.set(kk, kk, kk)); head.setMatrixAt(i, M4); }, commit() { body.instanceMatrix.needsUpdate = head.instanceMatrix.needsUpdate = true; } };
    pawnSets.push(s); return s;
  };
  const M4 = new THREE.Matrix4(), vv = new V3(), sv = new V3(), qI = new THREE.Quaternion();
  const PCOL = [RED, "#ffffff", BLUE, MINT, YEL, "#E06D53"];

  // ---------- chalet (front face at +z) ----------
  const chalet = (x, z, s, p = scene, nameplate = null) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); p.add(G);
    B(-8, 0, -6, 16, 6, 12, PAPER, G);
    const up = new THREE.Mesh(boxG, new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, map: texRep(plankT, 16, 5, 5) })); up.scale.set(16, 5, 12); up.position.set(0, 8.5, 0); add(up, G);
    // gable roof, ridge along z
    for (const sx of [-1, 1]) { const rf = B(-5.2, -0.4, -7.5, 10.4, 0.8, 15, ROOF, G); rf.position.set(sx * 4.3, 13.6, 0); rf.rotation.z = -sx * 0.52; }
    const gab = new THREE.Shape(); gab.moveTo(-8, 0); gab.lineTo(8, 0); gab.lineTo(0, 4.6); gab.closePath();
    for (const zz of [6, -6.4]) { const m = add(new THREE.Mesh(new THREE.ExtrudeGeometry(gab, { depth: 0.4, bevelEnabled: false }), toon(WOOD)), G); m.position.set(0, 11, zz); }
    B(3.5, 12, -2, 1.6, 4, 1.6, "#9AA0A6", G);
    // windows with red shutters
    const win = (wx, wy) => { B(wx - 1, wy, 6, 2, 2.2, 0.15, "#9FC3DC", G); B(wx - 1.15, wy - 0.15, 6.05, 2.3, 0.25, 0.2, PAPER, G); for (const sx of [-1, 1]) B(wx + sx * 1.55 - 0.45, wy, 6.02, 0.9, 2.2, 0.2, RED, G); };
    win(-4.5, 2.4); win(4.5, 2.4); win(-4.5, 7.6); win(4.5, 7.6);
    B(-1.1, 0, 6, 2.2, 3.8, 0.2, ROOF, G); // door
    // balcony
    B(-7.4, 6, 6, 14.8, 0.4, 1.8, WOOD, G);
    for (let i = 0; i <= 14; i++) B(-7.3 + i * 1.03, 6.4, 7.6, 0.25, 1.5, 0.15, PAPER, G);
    B(-7.4, 7.8, 7.5, 14.8, 0.3, 0.35, WOOD, G);
    if (nameplate) { const m = decal(5.2, 1.3, nameplate, 0, 4.85, 6.13, G, 0, false); m.renderOrder = 1; }
    return G;
  };

  // ============================ STATION H: the cut-open village strip ============================
  const HZ = 15; // front cut face
  // earth with a cavity for the main bunker (x -10.8..10.8, y -11.8..-1.2, z 1.2..15)
  earthBox(-74, -14, -130, 63.2, 14, 145); earthBox(10.8, -14, -130, 63.2, 14, 145);
  earthBox(-10.8, -14, -130, 21.6, 2.2, 145); earthBox(-10.8, -11.8, -130, 21.6, 11.8, 131.2); earthBox(-10.8, -1.2, 1.2, 21.6, 1.2, 13.8);
  // pale schematic ground beyond the strip (for the blast ring)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 600), toon("#C9D3C0")); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 15 - 300);
  const gridT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#C7D0D6"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(28,30,33,.16)"; g.lineWidth = 2; for (let k = 0; k <= w; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); } g.strokeStyle = "rgba(28,30,33,.32)"; g.lineWidth = 4; g.strokeRect(0, 0, w, h); });
  gridT.wrapS = gridT.wrapT = THREE.RepeatWrapping; gridT.repeat.set(900 / 24, 300 / 24);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(900, 300), new THREE.MeshToonMaterial({ map: gridT, gradientMap: grad })); table.rotation.x = -Math.PI / 2; table.position.set(0, -16, 150); table.receiveShadow = true; scene.add(table);
  B(-75, -16, -131, 150, 2, 147, "#3A3F44"); ground.receiveShadow = true; scene.add(ground);
  noInk.push(ground);
  // bunker shell (concrete)
  const BK = new THREE.Group(); scene.add(BK);
  const cw = (x0, y0, z0, w, h, d) => { const m = new THREE.Mesh(boxG, concMat(Math.max(w, d), h)); m.scale.set(w, h, d); m.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2); return add(m, BK); };
  cw(-10.8, -11.8, 1.2, 21.6, 0.8, 13.8); cw(-10.8, -2, 1.2, 21.6, 0.8, 13.8); cw(-10.8, -11, 1.2, 0.8, 9, 13.8); cw(10, -11, 1.2, 0.8, 9, 13.8); cw(-10, -11, 1.2, 20, 9, 0.8);
  B(-10.8, -11.85, HZ - 0.02, 21.6, 0.9, 0.06, CON3, BK); // lip
  // ceiling lamp
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfff2c8 });
  B(-1.5, -2.35, 7, 3, 0.35, 0.8, lampM, BK);
  const bl = new THREE.PointLight(0xffe6b8, 50, 15, 1.6); bl.position.set(0, -5, 7); BK.add(bl);
  // stairs up to the house (left)
  for (let k = 0; k < 9; k++) B(-10, -11 + k, 11 - k * 1.05, 2.6, 1, 1.05 + k * 1.05 > 9 ? 1.05 : 1.05, CON2, BK);
  B(-10, -11, 2, 2.6, 9, 0.2, CON3, BK);
  B(-7.35, -10.1, 2.5, 0.15, 0.15, 8.5, YEL, BK).rotation.x = -0.72; // handrail
  // bunks: two triple stacks against the back wall
  const shelterKit = new THREE.Group(); BK.add(shelterKit);
  const mattress = [];
  const bunk = (x0) => {
    for (const dx of [0, 4.6]) for (const dz of [0, 2.2]) B(x0 + dx, -11, 2 + dz, 0.25, 7.6, 0.25, WOOD, shelterKit);
    for (let k = 0; k < 3; k++) {
      const y = -10.2 + k * 2.4;
      B(x0, y, 2, 4.85, 0.3, 2.45, WOOD, shelterKit);
      mattress.push(B(x0 + 0.2, y + 0.3, 2.15, 4.45, 0.45, 2.15, k === 1 ? BLUE : "#E8E4DA", shelterKit));
      B(x0 + 0.35, y + 0.75, 2.4, 1.1, 0.35, 1.6, "#ffffff", shelterKit);
    }
  };
  bunk(-6.8); bunk(-1.6);
  // blast door in the back wall (right)
  const DX = 5.6;
  B(DX - 0.6, -11, 2, 4.8, 7.4, 0.6, CON3, BK); // frame
  const doorPiv = new THREE.Group(); doorPiv.position.set(DX + 3.6, -10.7, 2.75); BK.add(doorPiv);
  const doorTx = label(512, 768, (g, w, h) => {
    g.fillStyle = "#9AA3A8"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(20, 20, w - 40, h - 40);
    g.fillStyle = YEL; for (let i = -2; i < 8; i++) { g.save(); g.beginPath(); g.rect(20, h - 120, w - 40, 90); g.clip(); g.fillRect(i * 90, h - 120, 45, 90); g.restore(); }
    g.save(); g.translate(0, h - 120); g.fillStyle = INK; for (let i = -2; i < 8; i++) { g.beginPath(); g.moveTo(i * 90 + 45, 0); g.lineTo(i * 90 + 90, 0); g.lineTo(i * 90 + 45 + 0, 90); g.lineTo(i * 90, 90); g.fill(); } g.restore();
    g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(150); g.fillText("AUDIRA", w / 2, 170);
    g.fillStyle = INK; g.font = F(64); g.fillText("SCHUTZRAUM", w / 2, 300); g.font = FI(800, 46); g.fillText("TEMPAT PERLINDUNGAN", w / 2, 370);
    g.fillStyle = "rgba(28,30,33,.5)"; g.font = FI(800, 40); g.fillText("SR-114", w / 2, 450);
  });
  const doorFace = new THREE.MeshStandardMaterial({ map: doorTx, roughness: 0.42, metalness: 0.6, envMapIntensity: 0.25 });
  const door = new THREE.Mesh(boxG, [metal("#8C969C"), metal("#8C969C"), metal("#8C969C"), metal("#8C969C"), doorFace, metal("#8C969C")]);
  door.scale.set(3.6, 6.6, 0.55); door.position.set(-1.8, 3.3, 0); add(door, doorPiv);
  for (const yy of [1.2, 5.4]) C(0.05, yy - 0.6, 0.1, 0.22, 0.22, 1.2, metal("#5E676D"), doorPiv, 12);
  const lever = B(-3.1, 3.1, 0.3, 1.6, 0.3, 0.3, metal("#2E3236"), doorPiv);
  // air filter unit + duct (right wall)
  B(7.4, -11, 7.2, 2.6, 3.6, 2.2, MINT, BK); B(7.3, -7.5, 7.5, 2.8, 0.3, 1.6, "#4E8A70", BK);
  C(8.7, -7.4, 8.3, 0.45, 0.45, 5.4, metal("#C8CDD2"), BK, 14);
  const fan = new THREE.Group(); fan.position.set(7.35, -9.2, 8.3); BK.add(fan);
  C(0, -0.08, 0, 1.0, 1.0, 0.16, INK, fan, 24).rotation.z = Math.PI / 2;
  const blades = new THREE.Group(); fan.add(blades); blades.position.x = -0.12;
  for (let k = 0; k < 4; k++) { const bb = B(-0.04, -0.12, -0.12, 0.08, 1.7, 0.24, STEEL, blades); bb.position.set(0, 0, 0); bb.rotation.x = k * Math.PI / 2; bb.translateY(0.5); }
  const crank = B(7.2, -8.4, 9.6, 0.2, 0.2, 1.2, RED, BK);
  const filterTag = label(256, 128, (g, w, h) => { g.fillStyle = YEL; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(56); g.fillText("FILTER UDARA", w / 2, h / 2 + 3); });
  decal(2.2, 1.1, filterTag, 8.7, -8.9, 9.42, BK, 0, false);
  // water tanks (front right)
  const waterKit = new THREE.Group(); BK.add(waterKit);
  for (const [x, z] of [[7.6, 11.6], [8.8, 13.6], [5.9, 13.4]]) { C(x, -11, z, 0.9, 0.9, 2.6, plastic("#4F87B8"), waterKit, 18); C(x, -8.4, z, 0.3, 0.3, 0.3, plastic("#2E3236"), waterKit, 10); }
  const wTx = label(256, 96, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#2B5F8E"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(64); g.fillText("AIR", w / 2, h / 2 + 3); });
  decal(1.3, 0.5, wTx, 7.6, -9.6, 12.52, waterKit, 0, false);
  // supply shelf + crate in the middle
  B(1.6, -11, 9.6, 2.8, 1.6, 2, "#C69C6D", shelterKit); B(1.9, -9.4, 9.9, 2.2, 1.2, 1.5, "#BF8F5A", shelterKit);
  const cansTx = label(256, 96, (g, w, h) => { g.fillStyle = "#C69C6D"; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(60); g.fillText("MAKANAN", w / 2, h / 2 + 3); });
  decal(2.4, 0.9, cansTx, 3.0, -10.1, 11.62, shelterKit, 0, false);
  // repurposed kit: storage boxes + skis, gym bench + weights
  const storeKit = new THREE.Group(); BK.add(storeKit);
  const BOXC = ["#C69C6D", "#B88A58", "#D4AE7E", "#A97E4F"];
  const boxes = [];
  [[-6.8, 2.3, 2.4, 1.9, 2.0], [-4.3, 2.3, 2.2, 1.7, 2.0], [-6.6, 2.4, 2.0, 1.6, 1.8, 1.9], [-4.4, 2.4, 2.0, 1.5, 1.7, 1.7], [-6.1, 6.0, 2.6, 2.0, 2.2], [-3.4, 5.6, 2.0, 1.6, 1.8], [-1.4, 2.3, 2.4, 2.2, 2.0], [-1.2, 2.4, 2.1, 1.7, 1.8, 2.2]].forEach(([x, z, w, h, d, y], i) => { boxes.push(B(x, -11 + (y || 0), z, w, h, d, BOXC[i % 4], storeKit)); });
  for (const [k, c] of [[0, RED], [1, "#3A6EA5"]]) { const ski = B(-8.6 + k * 0.5, -11, 3.0, 0.3, 6.8, 0.12, c, storeKit); ski.rotation.z = -0.12; }
  const gymKit = new THREE.Group(); BK.add(gymKit);
  B(1.4, -11, 5.5, 4.4, 1.1, 1.3, INK, gymKit); B(1.4, -9.9, 5.5, 4.4, 0.3, 1.3, RED, gymKit); // bench
  for (const sx of [1.8, 5.4]) B(sx, -11, 4.2, 0.25, 4.2, 0.25, metal("#4A5056"), gymKit);
  const bar = C(3.6, 0, 4.3, 0.12, 0.12, 6.4, metal("#C8CDD2"), gymKit, 10); bar.rotation.z = Math.PI / 2; bar.position.set(3.6, -6.9, 4.3);
  for (const sx of [0.9, 6.3]) { const pl = C(sx, 0, 4.3, 1.0, 1.0, 0.35, toon(INK), gymKit, 20); pl.rotation.z = Math.PI / 2; pl.position.set(sx, -6.9, 4.3); }
  for (let k = 0; k < 4; k++) { const dbx = 1.6 + k * 1.1; for (const e of [-0.32, 0.32]) { const d = C(dbx, 0, 12.2 + e, 0.32, 0.32, 0.22, toon(k % 2 ? RED : INK), gymKit, 12); d.rotation.x = Math.PI / 2; d.position.set(dbx, -10.7, 12.2 + e); } }
  const mat = B(-0.2, -11, 11.2, 5.6, 0.12, 3.2, "#3A6EA5", gymKit);
  // red stamp on the back wall: WAJIB DIRAWAT
  const stampTx = label(512, 200, (g, w, h) => { g.strokeStyle = RED; g.lineWidth = 16; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(86); g.fillText("WAJIB DIRAWAT", w / 2, h / 2 + 6); });
  const wallStamp = decal(6.4, 2.5, stampTx, -4.0, -3.6, 2.03, BK); wallStamp.rotation.z = 0.08;
  // people in the bunker (hook + every-resident beat)
  const inPawn = pawns(24, PCOL);
  const redBunk = new THREE.MeshToonMaterial({ color: RED, gradientMap: grad, emissive: new THREE.Color(0) });
  const bunkSpots = []; for (const x0 of [-6.8, -1.6]) for (let k = 0; k < 3; k++) for (const dx of [1.3, 3.4]) bunkSpots.push([x0 + dx, -10.2 + k * 2.4 + 0.75, 3.9]);
  // cover slab over the cut (opens in the hook)
  const cover = new THREE.Group(); scene.add(cover);
  const coverL = earthBox(-10.8, -11.8, HZ, 10.8, 10.6, 0.6), coverR = earthBox(0, -11.8, HZ, 10.8, 10.6, 0.6);
  scene.remove(coverL, coverR); cover.add(coverL, coverR);

  // houses on top: AUDIRA chalet + neighbours with small bunkers on the cut face
  const plateTx = label(512, 128, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(96); g.fillText("AUDIRA", w / 2, h / 2 + 4); g.fillStyle = RED; g.fillRect(0, h - 14, w, 14); });
  chalet(0, 4, 1, scene, plateTx);
  flagPole(-13, 0, 6, 16, 4.2);
  const NB = [[-27, 0.72], [27, 0.72], [-50, 0.62], [50, 0.62]];
  const smallRooms = [];
  for (const [x, s] of NB) {
    chalet(x, 3, s);
    // small bunker window on the cut face
    const w = 10 * s, h = 6.4 * s, y0 = -2.2 - h;
    B(x - w / 2 - 0.5, y0 - 0.5, HZ - 0.3, w + 1, h + 1, 0.42, CON2);
    const room = B(x - w / 2, y0, HZ - 0.1, w, h, 0.25, "#F1E2C2");
    room.material = toon("#F1E2C2", { emissive: new THREE.Color(0x3a2c10) });
    for (let k = 0; k < 2; k++) B(x - w / 2 + 0.4, y0 + 0.6 + k * 2.6 * s, HZ + 0.15, w * 0.45, 0.35, 0.2, WOOD);
    B(x + w / 2 - 2.0 * s - 0.4, y0, HZ + 0.15, 2.0 * s, 4.4 * s, 0.2, "#8C969C");
    smallRooms.push([x, y0, w, s]);
  }
  for (const [x, z, s] of [[-17, -6, 1.2], [15, -10, 1], [-38, -12, 1.1], [38, -4, 0.9], [-60, -10, 1.1], [62, -14, 1.2], [-20, -30, 1.4], [24, -36, 1.3], [-6, -48, 1.2], [44, -50, 1.5], [-48, -56, 1.4], [8, -70, 1.3], [-30, -84, 1.2], [36, -92, 1.4]]) pine(x, 0, z, s);
  // path, fence posts
  B(-1.4, 0.01, 10, 2.8, 0.06, 5, "#D8CDB5");
  for (let x = -70; x <= 70; x += 4) if (Math.abs(x) > 3) B(x - 0.2, 0, 13.4, 0.4, 1.4, 0.4, PAPER);
  B(-70, 1.0, 13.45, 140, 0.25, 0.3, PAPER);
  // extra people for 'every resident': in neighbour bunkers
  const nbPawn = pawns(16, PCOL);
  // Alps behind the village
  const MT = [[-150, -260, 120, 70], [-60, -300, 150, 80], [40, -280, 135, 75], [140, -250, 115, 65], [230, -300, 140, 80], [-240, -290, 130, 75], [-100, -200, 70, 45], [90, -190, 80, 48], [0, -230, 95, 52]];
  for (const [x, z, h, rr] of MT) mountain(x, z, h, rr, 6);

  // blast ring schematic: point far behind the house, rings sweep to the house
  const BZ = -120; // 700 m mapped to 124 units
  const ringG = new THREE.Group(); ringG.position.set(0, 0.25, BZ); scene.add(ringG); noInk.push(ringG);
  const ringMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.9, toneMapped: false, side: THREE.DoubleSide, depthWrite: false });
  const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 96), ringMat.clone()); m.rotation.x = -Math.PI / 2; ringG.add(m); return m; });
  const dashRing = new THREE.Mesh(new THREE.RingGeometry(123, 124.4, 128, 1), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
  dashRing.rotation.x = -Math.PI / 2; ringG.add(dashRing);
  const core = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshBasicMaterial({ color: RED, toneMapped: false })); core.rotation.x = -Math.PI / 2; core.position.y = 0.05; ringG.add(core);
  const core2 = new THREE.Mesh(new THREE.RingGeometry(6.5, 8, 40), new THREE.MeshBasicMaterial({ color: INK })); core2.rotation.x = -Math.PI / 2; core2.position.y = 0.04; ringG.add(core2);
  // dimension line with label lying on the ground
  const dimG = new THREE.Group(); scene.add(dimG); noInk.push(dimG);
  const dim = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: INK })); dim.rotation.x = -Math.PI / 2; dimG.add(dim);
  const dimTx = label(512, 256, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(170); g.fillText("700 m", w / 2, h / 2 + 8); });
  const dimLab = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: dimTx, toneMapped: false })); dimLab.rotation.x = -Math.PI / 2; dimG.add(dimLab);
  const mtTx = label(512, 256, (g, w, h) => { g.fillStyle = RED; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(150); g.fillText("12 MT", w / 2, h / 2 + 8); });
  const mtLab = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: mtTx, toneMapped: false })); mtLab.rotation.x = -Math.PI / 2; mtLab.position.set(0, 0.3, BZ + 17); dimG.add(mtLab);
  // shield glow over the bunker when the wave passes
  const shield = new THREE.Mesh(new THREE.BoxGeometry(23, 11.5, 15), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  shield.position.set(0, -6.5, 8); scene.add(shield); noInk.push(shield);

  // ============================ STATION L: the 1963 law desk ============================
  const LX = -500;
  const L = new THREE.Group(); L.position.set(LX, 0, 0); scene.add(L);
  const floorT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#8A6A4A"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(28,30,33,.45)"; g.lineWidth = 4; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.save(); g.translate(i * 64, j * 64); if ((i + j) % 2) { for (let k = 8; k < 64; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 64); g.stroke(); } } else { for (let k = 8; k < 64; k += 16) { g.beginPath(); g.moveTo(0, k); g.lineTo(64, k); g.stroke(); } } g.strokeRect(0, 0, 64, 64); g.restore(); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(5, 4);
  const lf = new THREE.Mesh(new THREE.BoxGeometry(120, 2, 90), new THREE.MeshToonMaterial({ map: floorT, gradientMap: grad })); lf.position.set(0, -1, -5); add(lf, L);
  B(-60, 0, -40, 120, 60, 2, "#6F8079", L); // back wall
  B(-60, 0, -38.2, 120, 4, 0.6, "#4E5B55", L); // skirting
  // wall map of Switzerland
  const mapTx = label(1024, 680, (g, w, h) => {
    g.fillStyle = "#F1EAD8"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
    const lon0 = 5.8, lon1 = 10.6, lat0 = 45.7, lat1 = 47.95, k = Math.cos(46.8 * Math.PI / 180);
    const sx = (w - 120) / ((lon1 - lon0) * k), sy = (h - 170) / (lat1 - lat0), s = Math.min(sx, sy);
    const ox = (w - (lon1 - lon0) * k * s) / 2, oy = 120;
    g.beginPath(); CH.forEach(([lo, la], i) => { const x = ox + (lo - lon0) * k * s, y = oy + (lat1 - la) * s; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
    g.fillStyle = "#E9B9AE"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    const cx = ox + (8.2 - lon0) * k * s, cy = oy + (lat1 - 46.8) * s;
    g.fillStyle = RED; g.fillRect(cx - 60, cy - 60, 120, 120); g.fillStyle = "#fff"; g.fillRect(cx - 12, cy - 42, 24, 84); g.fillRect(cx - 42, cy - 12, 84, 24);
    g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle"; g.font = F(76); g.fillText("SWISS · 1963", 40, 64);
  });
  decal(30, 20, mapTx, -14, 33, -38.9, L, 0, false);
  // a wall clock + filing cabinet for the period office
  B(30, 0, -38, 12, 22, 9, "#7C8C84", L); for (let k = 0; k < 3; k++) { B(30.6, 2 + k * 6.6, -28.9, 10.8, 5.8, 0.3, "#8E9E96", L); B(34.8, 4.6 + k * 6.6, -28.6, 2.4, 0.6, 0.4, STEEL, L); }
  C(14, 34, -38.6, 4.5, 4.5, 0.6, PAPER, L, 32).rotation.x = Math.PI / 2;
  // desk
  B(-30, 0, -24, 60, 12, 30, "#6B4A2E", L); B(-31, 12, -25, 62, 1.6, 32, "#7A5535", L);
  const DY = 13.6;
  B(-28.5, DY, -22, 18, 0.12, 13, "#2F5D4A", L); // blotter
  // the scroll: paper unrolls toward the camera between two rollers
  const scrollTx = label(768, 1024, (g, w, h) => {
    g.fillStyle = "#F4E9CF"; g.fillRect(0, 0, w, h); g.strokeStyle = "#C9B48A"; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48);
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(84); g.fillText("DASAR HUKUM", w / 2, 110);
    g.font = F(150); g.fillStyle = RED; g.fillText("4 · X · 1963", w / 2, 250);
    g.fillStyle = INK; g.font = FI(800, 40); g.fillText("Setiap bangunan tempat tinggal", w / 2, 380); g.fillText("wajib punya tempat perlindungan", w / 2, 432); g.fillText("dari serangan nuklir.", w / 2, 484);
    g.fillStyle = "rgba(28,30,33,.32)"; for (let y = 560; y < 860; y += 34) g.fillRect(90, y, w - 180 - ((y * 7) % 120), 12);
    g.fillStyle = "#B01E14"; g.beginPath(); g.arc(w - 150, h - 130, 78, 0, 7); g.fill(); g.fillStyle = "#fff"; g.fillRect(w - 162, h - 172, 24, 84); g.fillRect(w - 192, h - 142, 84, 24);
  });
  const SCW = 15, SCL = 20, SZ0 = -21;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(SCW, SCL), new THREE.MeshToonMaterial({ map: scrollTx, gradientMap: grad }));
  paper.rotation.x = -Math.PI / 2; paper.receiveShadow = true; L.add(paper);
  const rollA = C(0, 0, 0, 0.9, 0.9, SCW + 1.6, "#E9DDBF", L, 20); rollA.rotation.z = Math.PI / 2;
  const rollB = C(0, 0, 0, 0.9, 0.9, SCW + 1.6, "#E9DDBF", L, 20); rollB.rotation.z = Math.PI / 2;
  for (const rl of [rollA, rollB]) for (const sx of [-1, 1]) { const k = C(0, sx * (SCW / 2 + 1.0) - 0.4, 0, 0.5, 0.5, 0.8, "#6B4A2E", rl, 10); }
  // the rubber stamp + its mark
  const stamp = new THREE.Group(); L.add(stamp);
  C(0, 0, 0, 2.6, 2.6, 0.9, RED, stamp, 24); C(0, 0.9, 0, 1.3, 1.6, 1.6, "#6B4A2E", stamp, 16); C(0, 2.5, 0, 0.6, 0.6, 2.6, "#6B4A2E", stamp, 12); const knob = add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), toon("#6B4A2E")), stamp); knob.position.y = 5.6;
  const markTx = label(512, 256, (g, w, h) => { g.strokeStyle = RED; g.lineWidth = 18; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(170); g.fillText("WAJIB", w / 2, h / 2 + 8); });
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ map: markTx, transparent: true, toneMapped: false, depthWrite: false })); mark.rotation.x = -Math.PI / 2; mark.rotation.z = 0.12; L.add(mark); noInk.push(mark);
  // model chalet with a bunker block under it, on the desk
  const modelG = new THREE.Group(); modelG.position.set(16, DY, -12); L.add(modelG);
  B(-7, 0, -6, 14, 4, 12, EARTH, modelG); B(-7.2, 4, -6.2, 14.4, 0.4, 12.4, GRASS, modelG);
  const mbase = new THREE.Group(); mbase.position.y = 4.4; modelG.add(mbase);
  chalet(0, 0, 0.42, mbase);
  const mb = B(-4.2, -0.01, -1.8, 8.4, 3.2, 5.8, CON3, modelG); mb.position.y = -1.0; // the bunker pulls out below
  const mbT = label(256, 96, (g, w, h) => { g.fillStyle = CON3; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(64); g.fillText("BUNKER", w / 2, h / 2 + 3); });
  const mbLab = decal(5, 1.9, mbT, 0, 0, 0.51, mb, 0, false); mbLab.scale.set(1 / 8.4, 1 / 3.2, 1);
  // desk lamp + phone
  const lamp = new THREE.Group(); lamp.position.set(-24, DY, -16); L.add(lamp);
  C(0, 0, 0, 2.2, 2.6, 0.6, "#2F5D4A", lamp); C(0, 0.6, 0, 0.25, 0.25, 9, STEEL, lamp, 8);
  const shade = add(new THREE.Mesh(new THREE.ConeGeometry(3, 2.6, 20, 1, true), toon("#2F5D4A", { side: THREE.DoubleSide })), lamp); shade.position.set(0.8, 9.4, 1.6); shade.rotation.x = 0.5;
  const lampLight = new THREE.PointLight(0xffe0a8, 70, 40, 1.4); lampLight.position.set(-20, DY + 7, -10); L.add(lampLight);
  B(-26, DY, -6, 5, 1.6, 6, RED, L); C(-23.5, DY + 1.6, -3, 1.2, 1.2, 0.5, INK, L, 18); B(-27, DY + 2.0, -5.4, 7, 0.9, 1.6, RED, L);

  // ============================ STATION T: Sonnenberg tunnel cutaway ============================
  const TX = 500;
  const T = new THREE.Group(); T.position.set(TX, 0, 0); scene.add(T);
  const prof = [[-90, 0], [-70, 18], [-52, 26], [-40, 44], [-28, 52], [-14, 66], [-4, 60], [8, 74], [22, 62], [34, 56], [48, 38], [62, 30], [78, 12], [92, 0]];
  const mShape = new THREE.Shape(); prof.forEach(([x, y], i) => i ? mShape.lineTo(x, y) : mShape.moveTo(x, y)); mShape.closePath();
  const hole = new THREE.Path(); hole.moveTo(-50, 3); hole.lineTo(50, 3); hole.lineTo(50, 13); hole.quadraticCurveTo(50, 17, 46, 17); hole.lineTo(-46, 17); hole.quadraticCurveTo(-50, 17, -50, 13); hole.closePath();
  mShape.holes.push(hole);
  const rockT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#8C8F94"; g.fillRect(0, 0, w, h); const q = mulberry(5);
    const cols = ["#9A9DA2", "#7F8388", "#A7A9AC", "#868A8F"];
    for (let k = 0; k < 8; k++) { g.fillStyle = cols[k % 4]; g.beginPath(); g.moveTo(0, k * 64); for (let x = 0; x <= w; x += 32) g.lineTo(x, k * 64 + Math.sin(x * 0.03 + k * 2) * 12 + 10); g.lineTo(w, k * 64 + 64); g.lineTo(0, k * 64 + 64); g.fill(); }
    g.strokeStyle = "rgba(28,30,33,.5)"; g.lineWidth = 4; for (let i = 0; i < 40; i++) { const x = q() * w, y = q() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + q() * 40, y + (q() - 0.5) * 30); g.stroke(); }
  });
  rockT.wrapS = rockT.wrapT = THREE.RepeatWrapping; rockT.repeat.set(1 / 40, 1 / 40);
  const mg = new THREE.ExtrudeGeometry(mShape, { depth: 60, bevelEnabled: false, curveSegments: 6 });
  const mtn = add(new THREE.Mesh(mg, [new THREE.MeshToonMaterial({ map: rockT, gradientMap: grad, color: 0xffffff }), toon("#8F9AA6")]), T); mtn.position.z = -60;
  const snowS = new THREE.Shape(); [[-30, 49], [-14, 66], [-4, 60], [8, 74], [22, 62], [34, 56], [37, 52], [20, 55], [8, 63], [-4, 52], [-16, 58], [-26, 47]].forEach(([x, y], i) => i ? snowS.lineTo(x, y) : snowS.moveTo(x, y)); snowS.closePath();
  const sn = add(new THREE.Mesh(new THREE.ExtrudeGeometry(snowS, { depth: 61, bevelEnabled: false }), toon("#F7F9FB")), T); sn.position.z = -60.5;
  // tunnel lining, back wall, road
  const TB = -16; // back wall depth
  const tw = (x0, y0, z0, w, h, d, c = null) => { const m = new THREE.Mesh(boxG, c ? toon(c) : concMat(Math.max(w, d), h)); m.scale.set(w, h, d); m.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2); return add(m, T); };
  tw(-50, 3, TB - 1, 100, 14, 1); tw(-50, 3, TB, 100, 0.6, 16.2, "#6E747A"); tw(-50, 16.2, TB, 100, 0.8, 16.2);
  B(-50, 3.62, TB, 100, 0.02, 16.2, "#6E747A", T);
  for (let x = -46; x < 46; x += 6) B(x, 3.63, -8.3, 3, 0.04, 0.5, "#F2F2F2", T);
  for (const ex of [-50.6, 49.6]) tw(ex, 3, TB, 1, 14, 16.2);
  // ceiling lamps
  for (let x = -44; x <= 44; x += 8) B(x - 1.2, 15.6, -9, 2.4, 0.5, 0.8, lampM, T);
  const tl1 = new THREE.PointLight(0xfff0d0, 140, 60, 1.3); tl1.position.set(TX - 25, 13, -6); scene.add(tl1);
  const tl2 = new THREE.PointLight(0xfff0d0, 140, 60, 1.3); tl2.position.set(TX + 25, 13, -6); scene.add(tl2);
  // concrete lining ring on the cut face
  const ringS = new THREE.Shape(); ringS.moveTo(-51.5, 2); ringS.lineTo(51.5, 2); ringS.lineTo(51.5, 18.5); ringS.lineTo(-51.5, 18.5); ringS.closePath(); ringS.holes.push(hole);
  const lr = add(new THREE.Mesh(new THREE.ExtrudeGeometry(ringS, { depth: 0.5, bevelEnabled: false }), toon(CON)), T); lr.position.z = 0;
  // shelves of stock (left), fuel drums (middle), bunks + water (right)
  const stockI = [];
  for (let s = 0; s < 3; s++) {
    const x0 = -46 + s * 9.5;
    for (const dx of [0, 7.6]) B(x0 + dx, 3.6, TB + 1, 0.3, 11.5, 0.3, "#4A5056", T), B(x0 + dx, 3.6, TB + 4.6, 0.3, 11.5, 0.3, "#4A5056", T);
    for (let k = 0; k < 4; k++) {
      const y = 3.6 + 0.6 + k * 2.9; B(x0, y, TB + 1, 7.9, 0.25, 3.9, "#6E747A", T);
      for (let b = 0; b < 3; b++) { const c = [["#C69C6D", "#D4AE7E", "#B88A58"], ["#6F8F5A", "#7EA066", "#5E7D4C"], ["#F0EEE6", "#E0DCCF", "#E8E4DA"]][(s + k) % 3][b]; stockI.push(B(x0 + 0.3 + b * 2.5, y + 0.25, TB + 1.4, 2.2, 1.6 + ((s * 7 + k * 3 + b) % 3) * 0.35, 3.0, c, T)); }
    }
  }
  const DR = [];
  for (let i = 0; i < 18; i++) { const x = -15 + (i % 6) * 2.6, z = TB + 1.6 + Math.floor(i / 6) * 2.6; DR.push(C(x, 3.6, z, 1.1, 1.1, 3.0, i % 3 === 0 ? YEL : RED, T, 16)); C(x, 6.6, z, 1.15, 1.15, 0.16, INK, T, 16); }
  const drumTx = label(256, 96, (g, w, h) => { g.fillStyle = YEL; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(66); g.fillText("BAHAN BAKAR", w / 2, h / 2 + 3); });
  decal(7, 2.6, drumTx, -1.5, 9.4, TB + 0.55, T, 0, false);
  const foodTx = label(256, 96, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(66); g.fillText("MAKANAN", w / 2, h / 2 + 3); });
  decal(7, 2.6, foodTx, -32, 16.0, TB + 0.55, T, 0, false);
  for (let s = 0; s < 3; s++) {
    const x0 = 6 + s * 8.4;
    for (const dx of [0, 6.6]) for (const dz of [0, 2.4]) B(x0 + dx, 3.6, TB + 1 + dz, 0.25, 9.4, 0.25, WOOD, T);
    for (let k = 0; k < 4; k++) { const y = 4.4 + k * 2.3; B(x0, y, TB + 1, 6.85, 0.25, 2.65, WOOD, T); B(x0 + 0.2, y + 0.25, TB + 1.15, 6.45, 0.4, 2.35, k % 2 ? BLUE : "#E8E4DA", T); }
  }
  for (let i = 0; i < 4; i++) C(34 + (i % 2) * 2.4 + 4, 3.6, TB + 2 + Math.floor(i / 2) * 2.4 + 6, 1.0, 1.0, 2.8, plastic("#4F87B8"), T, 16);
  // calendar board: months flip to 4+
  const calC = document.createElement("canvas"); calC.width = 512; calC.height = 384;
  const calTx = new THREE.CanvasTexture(calC); calTx.colorSpace = THREE.SRGBColorSpace;
  let calTxt = null;
  const paintCal = (n) => { const g = calC.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, 512, 384); g.fillStyle = RED; g.fillRect(0, 0, 512, 110); g.strokeStyle = INK; g.lineWidth = 16; g.strokeRect(8, 8, 496, 368); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(76); g.fillText("STOK", 256, 60); g.fillStyle = INK; g.font = F(200); g.fillText(n, 256, 230); g.font = F(64); g.fillText("BULAN", 256, 335); calTx.needsUpdate = true; };
  const cal = decal(8, 6, calTx, 21.5, 13.2, TB + 0.6, T, 0, false);
  const sonTx = label(1024, 160, (g, w, h) => { g.fillStyle = "#1F5E3A"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(108); g.fillText("TEROWONGAN SONNENBERG", w / 2, h / 2 + 4); });
  decal(30, 4.7, sonTx, 0, 21.5, 0.62, T, 0, false);
  // pines + mountains around the tunnel mountain
  for (const [x, z, s] of [[-80, 6, 1.4], [-70, 12, 1.1], [74, 8, 1.3], [84, 14, 1.0], [62, 16, 1.2], [-58, 14, 1.0]]) pine(x, 0, z, s, T);
  for (const [x, z, h, rr] of [[-130, -120, 110, 70], [-20, -170, 140, 80], [120, -130, 120, 70], [220, -160, 130, 80], [-230, -150, 120, 70]]) mountain(TX + x, z, h, rr, 6);
  const tg = new THREE.Mesh(new THREE.PlaneGeometry(700, 500), toon("#C9D3C0")); tg.rotation.x = -Math.PI / 2; tg.position.set(TX, -0.02, -150); scene.add(tg); noInk.push(tg);
  B(-100, -0.5, 0, 200, 0.5, 30, GRASS, T); // foreground lawn
  B(-100, -0.5, 0, 200, 0.5, 0.2, EARTH, T);

  // ============================ STATION P: the 114 % board + bars ============================
  const PX = 1000;
  const P = new THREE.Group(); P.position.set(PX, 0, 0); scene.add(P);
  B(-22, -3, -18, 44, 3, 36, PAPER, P); B(-22.5, -3.1, -18.5, 45, 0.4, 37, RED, P);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), toon("#D5DCE0")); pf.rotation.x = -Math.PI / 2; pf.position.set(PX, -3.05, -150); scene.add(pf); noInk.push(pf);
  const NS = 114;
  const slotPos = []; for (let i = 0; i < NS; i++) { const c = i % 12, rr = Math.floor(i / 12); slotPos.push([-16.5 + c * 3, rr === 9 ? 0 : 0, -13.5 + rr * 3]); }
  const slotI = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.5, 2.5), toon("#ffffff"), NS);
  slotI.castShadow = slotI.receiveShadow = true; slotI.frustumCulled = false; P.add(slotI);
  const pillowI = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.3, 0.7), toon("#ffffff"), NS); pillowI.frustumCulled = false; P.add(pillowI);
  const boardPawn = pawns(100, PCOL);
  // bars behind the board
  const barG = new THREE.Group(); barG.position.set(PX, 0, -34); scene.add(barG);
  B(-16, -3, -6, 32, 3, 12, PAPER, barG);
  const chBar = B(-11, 0, -3, 7, 1, 7, RED, barG), deBar = B(4, 0, -3, 7, 1, 7, "#3A3F44", barG);
  const deTop = B(4, 0, -3, 7, 0.3, 7, YEL, barG);
  const barLab = (txt, bg) => label(512, 200, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); g.fillStyle = bg === "#fff" ? INK : "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(112); g.fillText(txt, w / 2, h / 2 + 6); });
  decal(9, 3.5, barLab("SWISS", "#fff"), -7.5, -1.5, 6.05, barG, 0, false);
  decal(9, 3.5, barLab("JERMAN", "#fff"), 7.5, -1.5, 6.05, barG, 0, false);
  const chPct = decal(8, 3.1, barLab("114%", RED), -7.5, 0, 4.3, barG, 0, false), dePct = decal(8, 3.1, barLab("3%", "#3A3F44"), 7.5, 0, 4.3, barG, 0, false);
  for (const [x, z, h, rr] of [[-160, -260, 120, 70], [-40, -300, 150, 80], [90, -270, 130, 75], [210, -290, 140, 80]]) mountain(PX + x, z, h, rr, 6);

  // ---------- timing ----------
  const cutL = A("s3:Dasar"), cutH2 = A("s4:Belakangan"), cutT = A("s5:Ada"), cutP = A("s6:Tahun"), cutR = A("s7:Kini");
  const tReveal = A("s1:tempat") - 0.2, tDoor = A("s1:Bahkan") - 0.25;
  const tSemua = A("s1:semua"), tLebih = A("s1:lebih");
  const t78 = A("s4:1978"), tWave = A("s4:menahan"), tMT = A("s4:megaton"), t700 = A("s4:tujuh");
  const tStamp = A("s3:wajib") - 0.1, tBang = A("s3:Bangunan");
  const tEmpat = A("s5:empat");
  const tTiga = A("s6:tiga"), t5100 = A("s6:5.100"), tTot = A("s6:Totalnya"), t114 = A("s6:114");
  const tCH = A("s7:Sebagai"), tDE = A("s7:Jerman");
  const tGud = A("s7:gudang"), tOlah = A("s7:olahraga"), tWajib = A("s7:kewajiban"), tSet = A("s7:Setiap"), tEnd8 = A("s8:Negara");

  // ---------- camera: [t, px,py,pz, tx,ty,tz] ----------
  const H0 = [0, -6.5, 8]; // bunker centre
  const keys = [
    [0, 10, 4, 72, 0, -4.5, 4], [tReveal, 7, 0, 64, 0, -7, 5], [tDoor, 4, -3, 58, 1, -8.5, 6], [K.s1e, 2, -3.5, 54, 1, -8.7, 6],
    [K.s2, -6, 6, 74, 0, -2, 4], [A("s2:Eropa"), -20, 30, 120, 0, 2, -10], [A("s2:Perang") , -28, 46, 160, 0, 8, -30], [cutL - 0.02, -30, 48, 168, 0, 9, -34],
    [cutL, LX + 26, 52, 52, LX + 0, 12, -10], [A("s3:1963") + 0.3, LX + 18, 46, 44, LX - 2, 13, -12], [tBang, LX + 10, 42, 40, LX, 13, -12],
    [tStamp + 0.6, LX + 4, 50, 46, LX + 0, 13, -20], [A("s3:serangan"), LX + 4, 50, 48, LX + 6, 13, -20], [cutH2 - 0.02, LX + 4, 51, 50, LX + 8, 13, -20],
    [cutH2, 30, 22, 80, 0, -3, 2], [t78 + 0.3, 24, 26, 92, 0, -2, 0], [A("s4:bunker"), 30, 90, 110, 0, -6, -48], [tWave + 0.8, 26, 110, 120, 0, -6, -56],
    [t700, 22, 118, 124, 0, -6, -58], [cutT - 0.02, 20, 120, 126, 0, -6, -58],
    [cutT, TX + 30, 40, 150, TX + 0, 18, -10], [A("s5:Terowongan"), TX + 20, 30, 120, TX, 14, -8], [A("s5:disiapkan"), TX - 18, 20, 96, TX - 18, 12, -8],
    [A("s5:bahan"), TX + 0, 18, 92, TX - 2, 12, -8], [tEmpat, TX + 16, 18, 90, TX + 16, 13, -8], [cutP - 0.02, TX + 20, 19, 94, TX + 16, 13, -8],
    [cutP, PX + 18, 64, 66, PX, -2, -14], [tTiga, PX + 12, 66, 62, PX, -3, -14], [tTot, PX + 6, 70, 60, PX, -3, -15], [t114 + 0.8, PX + 2, 72, 58, PX, -3, -16],
    [K.s6e, PX - 2, 60, 66, PX, 2, -20], [tCH + 0.4, PX - 8, 28, 82, PX, 15, -34], [tDE + 0.5, PX - 3, 26, 78, PX + 1, 14, -34], [cutR - 0.02, PX + 1, 25, 76, PX + 1, 14, -34],
    [cutR, 14, -2, 52, 1, -6.4, 6], [tGud + 0.2, 8, -3, 48, -1, -6.4, 6], [tOlah + 0.3, 2, -3, 46, 2, -6.6, 6], [tWajib + 0.4, -2, -2.5, 46, 0, -6.2, 5],
    [tSet - 0.2, 0, -1, 50, 0, -5.6, 5], [tSet + 2.2, 0, 12, 112, 0, -4, 0], [tEnd8 - 0.3, 0, 18, 140, 0, -2, -4],
    [A("s8:Menurut"), -10, 32, 176, 0, 9, -30], [K.end, -16, 46, 200, 0, 15, -50], [K.dur, -17, 48, 204, 0, 16, -52],
  ];
  const camT = track(keys);
  const tgt = new V3();
  const cBot = new THREE.Color(), cTop = new THREE.Color();

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check(F(40))) { fontsOk = true; for (const [tx, paint] of labels) { const c = tx.image; paint(c.getContext("2d"), c.width, c.height); tx.needsUpdate = true; } calTxt = null; }
    const tq = Math.floor(t * 30) / 30;
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.25, c[1] + Math.sin(t * 0.29) * 0.18, c[2] + Math.cos(t * 0.31) * 0.2);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.position.set(tgt.x - 40, tgt.y + 90, tgt.z + 70); key.target.position.copy(tgt);
    const stH = t < cutL || (t >= cutH2 && t < cutT) || t >= cutR;
    // sky: cool steel by default, calm warm at the end
    const calm = ramp(t, tEnd8 - 1, tEnd8 + 2.5);
    cTop.set(0x9fc3dc).lerp(new THREE.Color(0xf2c7a0), calm * 0.6); cBot.set(0xeef1ee).lerp(new THREE.Color(0xfbe7d0), calm * 0.7);
    skyU.top.value.copy(cTop); skyU.bot.value.copy(cBot); scene.fog.color.copy(cBot);
    key.color.set(0xfff4e2).lerp(new THREE.Color(0xffd6a6), calm);

    for (const f of flags) { const pa = f.geo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = f.base[i * 3], y = f.base[i * 3 + 1]; pa.setZ(i, Math.sin(x * 0.9 - tq * 4.5 + y * 0.25 + f.ph) * 0.35 * (x / f.w)); } pa.needsUpdate = true; f.geo.computeVertexNormals(); }

    // ----- H: cover slab parts like two panels, door, fan, kits -----
    const op = ramp(t, tReveal, tReveal + 1.1);
    coverL.position.set(-5.4 - op * 13, -6.5 - op * 2, HZ + 0.3 + Math.sin(op * Math.PI) * 4); coverR.position.set(5.4 + op * 13, -6.5 - op * 2, HZ + 0.3 + Math.sin(op * Math.PI) * 4);
    cover.visible = op < 0.999;
    // door: open in the hook, slams shut, opens again for the repurposed beat
    let dOpen = 1.25 * (1 - eout(clamp01((t - tDoor) / 0.3)));
    if (t >= cutR) dOpen = 0.9 * ramp(t, cutR + 0.2, cutR + 1.4);
    doorPiv.rotation.y = dOpen;
    lever.rotation.z = t > tDoor + 0.3 && t < cutR ? -0.6 : 0;
    blades.rotation.x = t * (t >= tWajib ? 9 : 4);
    crank.rotation.x = t * 3;
    const repurp = t >= cutR;
    const gb = repurp ? back(clamp01((tq - tGud + 0.2) / 0.4)) : 0, gy = repurp ? back(clamp01((tq - tOlah + 0.1) / 0.4)) : 0;
    shelterKit.visible = !repurp; storeKit.visible = repurp && gb > 0.001; gymKit.visible = repurp && gy > 0.001;
    storeKit.scale.setScalar(Math.max(0.001, gb)); storeKit.position.set(-5 * (1 - gb), -10 * (1 - gb), 3 * (1 - gb));
    gymKit.scale.setScalar(Math.max(0.001, gy)); gymKit.position.set(3 * (1 - gy), -10 * (1 - gy), 6 * (1 - gy));
    waterKit.visible = true;
    const ws = repurp ? back(clamp01((tq - tWajib) / 0.25), 2) : 0;
    wallStamp.visible = ws > 0.001; wallStamp.scale.setScalar(Math.max(0.001, 1.6 - 0.6 * ws)); wallStamp.material.opacity = Math.min(1, ws * 1.4);
    // pawns in the main bunker: hook (fill at 'semua'), and again for 'every resident'
    for (let i = 0; i < inPawn.n; i++) {
      let k = 0, x = 0, y = 0, z = 0;
      if (i < bunkSpots.length) {
        [x, y, z] = bunkSpots[i];
        if (t < cutL && i < 10) k = back(clamp01((tq - tSemua - i * 0.05) / 0.3));
        else if (t >= tSet) k = back(clamp01((tq - tSet - i * 0.04) / 0.3));
        if (t >= cutR && t < tSet) k = 0;
        if (t >= tSet) { x = -8 + (i % 6) * 2.6; y = -11; z = 10.5 + Math.floor(i / 6) * 1.6; }
      }
      inPawn.set(i, x, y, z, k * 0.85);
    }
    inPawn.commit();
    // the extra free bunk glows at 'lebih'
    const lb = t < cutL ? ramp(t, tLebih - 0.1, tLebih + 0.25) * (0.6 + 0.4 * Math.sin(t * 8)) : 0;
    mattress[5].material = lb > 0.05 ? redBunk : toon("#E8E4DA"); redBunk.emissive.set(RED).multiplyScalar(0.4 * lb);
    // neighbour pawns appear for 'every resident'
    for (let i = 0; i < nbPawn.n; i++) {
      const [x, y0, w, s] = smallRooms[i % 4], j = Math.floor(i / 4);
      const k = t >= tSet ? back(clamp01((tq - tSet - 0.3 - i * 0.05) / 0.3)) : 0;
      nbPawn.set(i, x - w / 2 + 1.5 * s + j * 1.7 * s, y0 + 0.1, HZ + 0.6, k * s * 0.9);
    }
    nbPawn.commit();
    // blast-ring schematic (s4)
    const ringOn = t >= cutH2 && t < cutT;
    ringG.visible = dimG.visible = ringOn;
    if (ringOn) {
      const rIn = ramp(t, A("s4:bunker") - 0.4, A("s4:bunker") + 0.6);
      core.scale.setScalar(Math.max(0.001, back(rIn))); core2.scale.setScalar(Math.max(0.001, back(rIn)));
      rings.forEach((m, i) => { const ph = ((t - tWave) * 0.55 - i * 0.33); const u = ph - Math.floor(ph); const on = t > tWave - 0.2 + i * 0.33 / 0.55 ? 1 : 0; const rr = 6 + u * 120; m.scale.setScalar(rr); m.material.opacity = on * 0.9 * (1 - u * 0.5) * rIn; m.visible = on > 0; });
      dashRing.material.opacity = 0.55 * ramp(t, t700 - 0.3, t700 + 0.3);
      const dl = ramp(t, t700 - 0.2, t700 + 0.6) * 112;
      dim.scale.set(1, dl, 1); dim.position.set(16, 0.3, BZ + 6 + dl / 2);
      dimLab.position.set(16, 0.35, BZ + 62); dimLab.scale.setScalar(Math.max(0.001, back(clamp01((tq - t700 - 0.2) / 0.35))));
      mtLab.scale.setScalar(Math.max(0.001, back(clamp01((tq - tMT + 0.1) / 0.35))));
      const hit = clamp01((t - tWave - 0.2) / 1.6);
      shield.material.opacity = 0.32 * Math.sin(Math.PI * hit) * (t < cutT ? 1 : 0);
    } else shield.material.opacity = 0;

    // ----- L: scroll unroll, stamp -----
    const un = eout(clamp01((t - cutL - 0.2) / 1.5));
    const len = Math.max(0.5, SCL * un);
    paper.scale.set(1, len / SCL, 1); paper.position.set(-4, DY + 0.06, SZ0 + len / 2);
    paper.material.map.repeat.set(1, len / SCL); paper.material.map.offset.set(0, 1 - len / SCL);
    rollA.position.set(-4, DY + 0.9, SZ0 - 0.4); rollB.position.set(-4, DY + 0.9, SZ0 + len + 0.4); rollB.rotation.x = -un * 14;
    const sx0 = 1.0, sz0 = SZ0 + 14.6;
    let sy;
    if (t < tStamp) { const u = clamp01((t - (tStamp - 0.45)) / 0.45); sy = DY + 0.12 + 18 * (1 - u * u); }
    else sy = DY + 0.12 + Math.max(0, t - tStamp - 0.3) * 34;
    stamp.visible = t > tStamp - 0.45 && sy < DY + 18;
    stamp.position.set(sx0, sy, sz0); stamp.rotation.y = 0.12;
    mark.visible = t >= tStamp; mark.position.set(sx0, DY + 0.1, sz0); mark.scale.setScalar(t >= tStamp ? 1 + 0.12 * Math.exp(-(t - tStamp) * 10) : 1);
    // model bunker slides out at 'Bangunan'
    const mo = back(clamp01((tq - tBang) / 0.5));
    mb.position.set(0, 2.0, mo * 5.5);
    mb.visible = t >= tBang - 0.1;

    // ----- T: calendar -----
    const nm = t < A("s5:lebih") ? "0" : t < tEmpat ? String(Math.min(3, 1 + Math.floor((t - A("s5:lebih")) / 0.25))) : "4+";
    if (nm !== calTxt) { calTxt = nm; paintCal(nm); }
    const pulse = t >= tEmpat ? 1 + 0.15 * Math.exp(-(t - tEmpat) * 6) : 1;
    cal.scale.setScalar(pulse);

    // ----- P: board fills -----
    const c3 = new THREE.Color();
    for (let i = 0; i < NS; i++) {
      const [x, y, z] = slotPos[i];
      const a = i < 100 ? tTiga + (i / 100) * (t5100 - tTiga + 0.3) : t5100 + 0.2 + (i - 100) * 0.06;
      let k = t >= cutP ? back(clamp01((tq - a) / 0.3)) : 0;
      const free = i >= 100 && t >= t114 + 1.0;
      const fy = free ? 0.4 * Math.abs(Math.sin(t * 4 + i)) : 0;
      M4.compose(vv.set(x, y + 0.25 + fy, z), qI, sv.set(k || 0.0001, k || 0.0001, k || 0.0001)); slotI.setMatrixAt(i, M4);
      slotI.setColorAt(i, c3.set(free ? RED : i < 100 ? BLUE : "#4F6F8F"));
      M4.compose(vv.set(x, y + 0.6 + fy, z - 0.6), qI, sv.set(k || 0.0001, k || 0.0001, k || 0.0001)); pillowI.setMatrixAt(i, M4);
      pillowI.setColorAt(i, c3.set("#ffffff"));
    }
    slotI.instanceMatrix.needsUpdate = pillowI.instanceMatrix.needsUpdate = true; slotI.instanceColor.needsUpdate = true; pillowI.instanceColor.needsUpdate = true;
    for (let i = 0; i < 100; i++) {
      const [x, y, z] = slotPos[i];
      const a = t114 - 0.4 + (i % 12) * 0.03 + Math.floor(i / 12) * 0.07;
      const u = clamp01((tq - a) / 0.35);
      const k = t >= cutP && tq >= a ? 1 : 0;
      boardPawn.set(i, PX + x, y + 0.5 + (1 - eout(u)) * 9, z, k * 0.95);
    }
    boardPawn.commit();
    const chH = 114 * 0.26 * eout(clamp01((t - tCH + 0.2) / 1.0)), deH = 3 * 0.26 * eout(clamp01((t - tDE) / 0.6));
    chBar.scale.y = Math.max(0.01, chH); chBar.position.y = chH / 2; deBar.scale.y = Math.max(0.01, deH); deBar.position.y = deH / 2; deTop.position.y = deH + 0.15; deTop.visible = deH > 0.05;
    chPct.position.y = chH + 2.4; chPct.visible = chH > 1; dePct.position.y = deH + 2.4; dePct.visible = deH > 0.1;
    chPct.scale.setScalar(Math.min(1, chH / 4)); dePct.scale.setScalar(t >= tDE ? back(clamp01((t - tDE) / 0.35)) : 0.001);

    // ----- ink pre-pass + render -----
    const hidden = noInk.map((o) => o.visible);
    noInk.forEach((o) => { o.visible = false; });
    const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null; scene.overrideMaterial = nMat;
    r.setRenderTarget(rtN); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, cam);
    r.setRenderTarget(null); scene.overrideMaterial = null; scene.background = bg; scene.fog = fog;
    noInk.forEach((o, i) => { o.visible = hidden[i]; });
    // labels/decals are basic planes: hidden from nothing, fine
    comp.render();
  };
}
