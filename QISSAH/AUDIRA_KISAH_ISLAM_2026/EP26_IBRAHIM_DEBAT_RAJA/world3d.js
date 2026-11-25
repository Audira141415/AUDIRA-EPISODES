// EP26 IBRAHIM MENDEBAT RAJA. TEXTVOYAGE: monumental 3D typography in volumetric light. One connected world on a
// single axis (camera looks "north", -z; east = +x = screen right):
//   gate (z 30)  ->  throne hall (z 22..-30, pillars, high west windows with god-rays, dust)  ->  open arch (z -30)
//   ->  desert horizon with two stepped stone pedestals (z -64) that carry the s5 words, sun rising in the east.
// Words are real extruded glyphs (Cinzel 600/900 converted to typeface data in fonts/). The king's words are heavy
// stone/brass; Ibrahim's words are thin letters made of light. Clipping planes do the cracks, the light-beam carving
// and the crumble to sand.
// Depiction: Nabi Ibrahim never appears in any form. His presence is a small clay lamp and sentences carved in light.
// The king is a faceless black silhouette on a massive throne with a gold crown. The two prisoners (s4, per some
// mufasir) are faceless silhouettes; one simply fades into darkness, the other walks out free. No violence shown.
// Every value is a pure function of t (seek-safe, no Math.random).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, envStrips, back } from "./lib3d.js";
import { ShaderPass } from "./ShaderPass.js";
import F600 from "./cinzel-600.js";
import F900 from "./cinzel-900.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const mix = (a, b, u) => a + (b - a) * u;
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }

// ---------- glyphs -> extruded letters
function glyph(F, ch, size) {
  const g = F.glyphs[ch] || F.glyphs["?"];
  const sc = size / F.resolution;
  const path = new THREE.ShapePath();
  const o = g.o ? g.o.split(" ") : [];
  for (let i = 0; i < o.length;) {
    const a = o[i++];
    if (a === "m") path.moveTo(o[i++] * sc, o[i++] * sc);
    else if (a === "l") path.lineTo(o[i++] * sc, o[i++] * sc);
    else if (a === "q") { const x = o[i++] * sc, y = o[i++] * sc, cx = o[i++] * sc, cy = o[i++] * sc; path.quadraticCurveTo(cx, cy, x, y); }
    else if (a === "b") { const x = o[i++] * sc, y = o[i++] * sc, c1x = o[i++] * sc, c1y = o[i++] * sc, c2x = o[i++] * sc, c2y = o[i++] * sc; path.bezierCurveTo(c1x, c1y, c2x, c2y, x, y); }
  }
  return { shapes: o.length ? path.toShapes() : [], adv: g.ha * sc };
}
function widthOf(F, text, size, sp = 0.05) {
  let w = 0; for (const ch of text) w += glyph(F, ch, size).adv + size * sp; return w - size * sp;
}
// One line of letters, centred on x=0, baseline y=0, front face at z=+depth/2. Each letter is its own mesh with its
// pivot at its own centre so it can move alone (rise, shuffle).
function carve(F, text, size, depth, mat, { bevel = 0.03, sp = 0.05, curve = 6 } = {}) {
  const G = new THREE.Group(); const letters = []; let x = 0;
  for (const ch of text) {
    const { shapes, adv } = glyph(F, ch, size);
    if (shapes.length) {
      const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 2, curveSegments: curve });
      geo.computeBoundingBox();
      const bb = geo.boundingBox, cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
      geo.translate(-cx, -cy, -depth / 2);
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x + cx, cy, 0);
      m.castShadow = m.receiveShadow = true;
      G.add(m); letters.push(m);
    }
    x += adv + size * sp;
  }
  const w = x - size * sp;
  for (const m of letters) { m.position.x -= w / 2; m.userData.home = m.position.clone(); }
  G.userData.w = w;
  return { G, letters, w };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x07060a, fog: 0.012, exp: 1.05, bloom: [0.32, 0.4, 0.86], shadow: true });
  r.localClippingEnabled = true;
  // guard: a single NaN/Inf pixel would be smeared over the whole frame by the bloom blur (black frame at t=64.0)
  comp.insertPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;float f(float x){return (x<60.0&&x>=0.0)?x:(x>=60.0?60.0:0.0);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(f(c.r),f(c.g),f(c.b),1.0);}" }), 1);
  cam.fov = 42; cam.near = 0.05; cam.far = 1400; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2626);
  const C = (h) => new THREE.Color(h);
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), tq = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
  envStrips(r, scene, [[40, 6, 0xffd9a0, 0.9, -30, 25, 0], [30, 8, 0xffb070, 0.6, 0, 10, -40], [20, 20, 0x6070a0, 0.25, 30, 15, 10], [50, 6, 0xffe8c0, 0.35, 0, 30, 30]], 0x0c0906);

  // ---------- timing
  const tSat = A("s1:Satu"), tCr = A("s1:terdiam") - 0.05;
  const tKer = A("s2:kerajaan");
  const tTuh = A("s3:Tuhanku"), tYang = A("s3:Yang"), tRaja = A("s3:Raja"), tSom = A("s3:sombong");
  const tAku = A("s3:aku"), tPun = A("s3:pun"), tBisa = A("s3:bisa");
  const tMem = A("s4:memanggil"), tEks = A("s4:dieksekusi"), tBeb = A("s4:dibebaskan"), tMain = A("s4:memainkan"), tPert = A("s4:pertanyaan");
  const tMat = A("s5:matahari"), tTim = A("s5:timur"), tTer = A("s5:terbitkanlah"), tBar = A("s5:barat");
  const tBing = A("s6:bingunglah"), tKuasa = A("s6:Kekuasaannya"), tGes = A("s6:menggesernya");
  const tZal = A("s7:zalim"), tPal = A("s8:paling#2"), tJel = A("s8:jelas"), tKis = A("s8:Kisah");
  const tCrum0 = tKuasa + 1.0, dCrum = 3.2;

  // ---------- materials
  const stoneTex = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#8a7258"; x.fillRect(0, 0, w, h);
    const rr = mulberry(7);
    for (let i = 0; i < 2600; i++) { const v = rr(); x.fillStyle = `rgba(${v > .5 ? "255,240,210" : "40,26,14"},${0.04 + rr() * 0.06})`; x.fillRect(rr() * w, rr() * h, 1 + rr() * 5, 1 + rr() * 3); }
    for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(40,26,14,${0.08 + rr() * 0.1})`; x.lineWidth = 1; x.beginPath(); let px = rr() * w, py = rr() * h; x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (rr() - .5) * 60; py += (rr() - .5) * 60; x.lineTo(px, py); } x.stroke(); }
  }, [2, 2]);
  const tileTex = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#1c1612"; x.fillRect(0, 0, w, h);
    const rr = mulberry(11);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = 22 + rr() * 10; x.fillStyle = `rgb(${v + 6},${v},${v - 4})`; x.fillRect(i * 128 + 2, j * 128 + 2, 124, 124); }
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,230,190,${rr() * 0.04})`; x.fillRect(rr() * w, rr() * h, 2, 2); }
  }, [14, 30]);
  const stoneM = new THREE.MeshStandardMaterial({ color: 0xc4a47c, roughness: 0.78, metalness: 0.05, map: stoneTex });
  const wallM = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9, metalness: 0, map: stoneTex });
  const basaltM = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.5, metalness: 0.15, map: stoneTex });
  const floorM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05, map: tileTex });
  const brassM = new THREE.MeshStandardMaterial({ color: 0xb58a48, roughness: 0.3, metalness: 0.92 });
  const goldM = new THREE.MeshStandardMaterial({ color: 0xe0b050, roughness: 0.22, metalness: 1, emissive: 0x3a2400, emissiveIntensity: 0.4 });
  const silM = new THREE.MeshStandardMaterial({ color: 0x050404, roughness: 1, metalness: 0 });
  const sandM = new THREE.MeshStandardMaterial({ color: 0xa47e52, roughness: 0.96, metalness: 0 });
  const lightMat = (col = 0xffd8a0, ei = 2.6) => new THREE.MeshStandardMaterial({ color: 0x2a1c08, emissive: col, emissiveIntensity: ei, roughness: 0.4, metalness: 0 });

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0x4a3c5a, 0x140d08, 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffc888, 1.5); key.position.set(-24, 30, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { near: 1, far: 120, left: -34, right: 34, top: 34, bottom: -34 }); key.shadow.camera.updateProjectionMatrix();
  key.target.position.set(0, 0, 4); scene.add(key); scene.add(key.target);
  const sunL = new THREE.DirectionalLight(0xffb070, 0); sunL.castShadow = true;
  sunL.shadow.mapSize.set(2048, 2048); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
  Object.assign(sunL.shadow.camera, { near: 1, far: 200, left: -26, right: 26, top: 26, bottom: -26 }); sunL.shadow.camera.updateProjectionMatrix();
  scene.add(sunL); scene.add(sunL.target); sunL.target.position.set(0, 0, -10);
  const rim = new THREE.DirectionalLight(0x6a78b8, 0.5); rim.position.set(4, 8, -40); scene.add(rim);
  const lampL = new THREE.PointLight(0xffa850, 0, 9, 1.6); scene.add(lampL);
  const throneL = new THREE.SpotLight(0xffb070, 0, 30, 0.42, 0.6, 1.2); throneL.position.set(0, 14, -14); throneL.target.position.set(0, 2, -22); scene.add(throneL); scene.add(throneL.target);
  const blockL = new THREE.PointLight(0xffd29a, 0, 11, 1.5); blockL.position.set(-3.0, 2.2, -6.4); scene.add(blockL);
  const kbL = new THREE.PointLight(0xffc890, 0, 14, 1.3); kbL.position.set(1.2, 4.2, -3.5); scene.add(kbL);
  const gateF = new THREE.SpotLight(0xffd8a8, 260, 60, 0.5, 0.6, 1.2); gateF.position.set(-6, 14, 48); gateF.target.position.set(0, 2, 30); scene.add(gateF); scene.add(gateF.target);
  const gateL = new THREE.PointLight(0xffc070, 0, 16, 1.4); gateL.position.set(0.6, 1.9, 31.5); scene.add(gateL);

  // ---------- sky dome (pre-dawn night; east horizon warms when the sun rises; west stays dark)
  const skyU = { uSun: { value: new THREE.Vector3(0.1, -0.05, -1).normalize() }, uDawn: { value: 0 }, uDay: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uSun;uniform float uDawn;uniform float uDay;varying vec3 vD;
void main(){vec3 d=normalize(vD);float e=d.y;
vec3 zen=vec3(.010,.010,.026),hor=vec3(.05,.042,.075);
vec3 c=mix(hor,zen,smoothstep(0.,.42,e));
float sa=atan(uSun.x,-uSun.z),da=atan(d.x,-d.z);float dd=da-sa;
float east=exp(-dd*dd/0.016);float wide=exp(-dd*dd/0.09);
float h=exp(-max(e,0.)*9.);
c+=uDawn*(vec3(1.,.42,.14)*east*h*0.9+vec3(.55,.28,.16)*wide*exp(-max(e,0.)*4.)*.22);
c=mix(c,mix(vec3(.62,.42,.3),vec3(.22,.3,.48),smoothstep(0.,.5,e)),uDay*(.35+.65*wide));
float sd=max(dot(d,normalize(uSun)),0.);c+=uDawn*vec3(1.,.62,.3)*pow(sd,900.)*.6;
gl_FragColor=vec4(c,1.);}`,
  }));
  scene.add(sky);
  // stars: stay on the west, fade only where the dawn reaches
  const NS = 420, stars = pts(scene, NS, { color: 0xffffff, size: 2.6, add: true, opacity: 1 });
  stars.m.fog = false; stars.m.sizeAttenuation = false; stars.m.size = 2.4;
  const SD = [];
  for (let i = 0; i < NS; i++) {
    const az = (rnd() - 0.5) * 2.2, el = 0.03 + Math.pow(rnd(), 1.6) * 0.75;
    SD.push([az, el, 0.3 + rnd() * 0.7, rnd() * 6.28]);
    stars.pos[i * 3] = Math.sin(az) * Math.cos(el) * 850; stars.pos[i * 3 + 1] = Math.sin(el) * 850; stars.pos[i * 3 + 2] = -Math.cos(az) * Math.cos(el) * 850;
  }
  stars.commit();

  // ---------- sun
  const sun = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 0.75, 0.28), fog: false }));
  scene.add(sun);
  const glowTex = canvasTex(256, 256, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,220,160,1)"); g.addColorStop(0.18, "rgba(255,170,90,.55)"); g.addColorStop(0.5, "rgba(255,120,60,.14)"); g.addColorStop(1, "rgba(255,100,40,0)"); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  const sunGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  scene.add(sunGlow);
  const SUN_O = new THREE.Vector3(0, 8.4, -14); // sun seen from the s5 vantage, straight behind "TIMUR"

  // ---------- ground: hall floor, plaza, desert dunes
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 100), floorM); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.005, 6); floor.receiveShadow = true; scene.add(floor);
  {
    const W = 1400, D = 1100, g = new THREE.PlaneGeometry(W, D, 220, 180); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i) - 470;
      let h = 0;
      if (z < -34) {
        const far = sm((-z - 40) / 60);
        const ped = Math.min(sm((Math.hypot(x + 3.7, z + 50) - 5) / 6), sm((Math.hypot(x - 3.7, z + 50) - 5) / 6));
        const aisle = sm((Math.abs(x) - 3) / 10) * 0.6 + 0.4;
        h = (fbm(x * 0.03 + 3, z * 0.03) - 0.35) * 9 * far * ped * aisle + Math.sin(x * 0.05 + z * 0.02) * 1.2 * far * ped;
      } else if (z > 22) h = (fbm(x * 0.05, z * 0.05) - 0.5) * 0.6 * sm((z - 40) / 30);
      p.setY(i, Math.max(-0.02, h));
      p.setZ(i, z);
    }
    g.computeVertexNormals();
    const desert = new THREE.Mesh(g, sandM); desert.receiveShadow = true; scene.add(desert);
  }

  // ---------- hall architecture
  const add = (geo, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const HALL_N = 22, HALL_S = -30, HW = 10.8;
  // side walls with emissive high windows
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 0.95, 0.55) });
  const winDim = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.22, 0.32) });
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.8, 19, HALL_N - HALL_S), wallM, s * (HW + 0.4), 9.5, (HALL_N + HALL_S) / 2);
    for (let z = 15; z > HALL_S; z -= 7) { const w = add(new THREE.PlaneGeometry(2.0, 3.6), s < 0 ? winM : winDim, s * (HW - 0.02), 13.2, z); w.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2; w.castShadow = false; }
  }
  add(new THREE.BoxGeometry(2 * HW + 1.6, 0.8, HALL_N - HALL_S), wallM, 0, 19.2, (HALL_N + HALL_S) / 2);
  // front facade with the doorway (camera enters here at the end of s1)
  add(new THREE.BoxGeometry(14, 19, 1.2), wallM, -11, 9.5, HALL_N);
  add(new THREE.BoxGeometry(14, 19, 1.2), wallM, 11, 9.5, HALL_N);
  add(new THREE.BoxGeometry(8, 7, 1.2), wallM, 0, 15.5, HALL_N);
  add(new THREE.BoxGeometry(9, 0.6, 1.6), brassM, 0, 12.2, HALL_N + 0.1);
  // back wall with the great open arch to the desert
  add(new THREE.BoxGeometry(4.2, 19, 1.4), wallM, -(7 + 2.1 + 0.3), 9.5, HALL_S);
  add(new THREE.BoxGeometry(4.2, 19, 1.4), wallM, 7 + 2.1 + 0.3, 9.5, HALL_S);
  add(new THREE.BoxGeometry(14.6, 5, 1.4), wallM, 0, 16.5, HALL_S);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.5, 14, 1.8), brassM, s * 7.3, 7, HALL_S);
  add(new THREE.BoxGeometry(15.1, 0.5, 1.8), brassM, 0, 14.1, HALL_S);
  // pillars
  const colGeo = new THREE.CylinderGeometry(0.78, 0.86, 15.2, 24, 1);
  { const p = colGeo.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)); const f = 1 - 0.05 * Math.pow(Math.abs(Math.cos(a * 6)), 3); p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * f); } colGeo.computeVertexNormals(); }
  const PZ = [18, 11, 4, -3, -10, -17, -24];
  let audPlinth = null;
  for (const s of [-1, 1]) for (const z of PZ) {
    const pl = add(new THREE.BoxGeometry(2.1, 1.0, 2.1), stoneM, s * 7, 0.5, z);
    add(new THREE.BoxGeometry(1.8, 0.3, 1.8), stoneM, s * 7, 1.15, z);
    add(colGeo, wallM, s * 7, 1.3 + 7.6, z);
    add(new THREE.BoxGeometry(2.2, 0.7, 2.2), stoneM, s * 7, 16.9 + 0.35, z);
    add(new THREE.BoxGeometry(2.0, 0.25, 2.0), brassM, s * 7, 16.75, z);
    if (s < 0 && z === -3) audPlinth = pl;
  }
  // AUDIRA carved small on the front face of the left pillar plinth next to the lamp (s8)
  {
    const tx = canvasTex(512, 256, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.font = "700 92px Cinzel, Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = "rgba(20,12,4,.85)"; x.fillText("AUDIRA", w / 2 + 3, h / 2 + 4);
      x.fillStyle = "rgba(255,226,170,.55)"; x.fillText("AUDIRA", w / 2 - 1, h / 2 - 1);
      x.strokeStyle = "rgba(20,12,4,.6)"; x.lineWidth = 3; x.strokeRect(36, 40, w - 72, h - 80);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.85), new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: 0.8, metalness: 0.1 }));
    m.position.set(-7, 0.5, -3 + 1.06); m.receiveShadow = true; scene.add(m);
  }

  // ---------- throne, dais, faceless king silhouette with a crown
  const TZ = -23.5;
  [[10, 7.2], [8, 5.8], [6.2, 4.5]].forEach(([w, d], i) => add(new THREE.BoxGeometry(w, 0.35, d), basaltM, 0, 0.175 + i * 0.35, TZ + 0.2 - i * 0.2));
  for (const [w, d, y, z] of [[10.1, 0.08, 0.36, TZ + 0.2 + 3.62], [8.1, 0.08, 0.71, TZ + 2.92]]) add(new THREE.BoxGeometry(w, 0.05, d), brassM, 0, y, z);
  const DY = 1.05;
  add(new THREE.BoxGeometry(2.8, 0.8, 1.9), basaltM, 0, DY + 0.4, TZ);
  add(new THREE.BoxGeometry(3.4, 5.4, 0.6), stoneM, 0, DY + 2.7, TZ - 1.05);
  add(new THREE.BoxGeometry(3.7, 0.3, 0.8), brassM, 0, DY + 5.5, TZ - 1.05);
  
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.5, 1.5, 1.9), basaltM, s * 1.6, DY + 0.75, TZ); add(new THREE.BoxGeometry(0.6, 0.12, 2.0), brassM, s * 1.6, DY + 1.56, TZ); add(new THREE.SphereGeometry(0.2, 12, 8), goldM, s * 1.6, DY + 1.7, TZ + 0.9); }
  const king = new THREE.Group(); king.position.set(0, DY + 0.8, TZ - 0.15); scene.add(king);
  const kTorso = new THREE.Group(); king.add(kTorso);
  add(new THREE.CylinderGeometry(0.42, 0.62, 1.5, 16), silM, 0, 0.75, -0.1, kTorso);
  add(new THREE.SphereGeometry(0.5, 16, 10), silM, 0, 1.45, -0.1, kTorso).scale.set(1.25, 0.55, 0.9);
  const kHead = new THREE.Group(); kHead.position.set(0, 1.62, -0.05); kTorso.add(kHead);
  add(new THREE.SphereGeometry(0.31, 18, 14), silM, 0, 0.3, 0, kHead).scale.set(0.92, 1.08, 1);
  const crown = new THREE.Group(); crown.position.set(0, 0.56, 0); kHead.add(crown);
  add(new THREE.CylinderGeometry(0.31, 0.28, 0.2, 24, 1, true), goldM, 0, 0, 0, crown).material = goldM;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; add(new THREE.ConeGeometry(0.06, 0.22, 6), goldM, Math.sin(a) * 0.29, 0.19, Math.cos(a) * 0.29, crown); }
  for (const s of [-1, 1]) {
    const arm = add(new THREE.CylinderGeometry(0.15, 0.13, 1.0, 10), silM, s * 0.66, 0.95, 0.1, kTorso); arm.rotation.x = 0.5; arm.rotation.z = s * 0.1;
    add(new THREE.CylinderGeometry(0.13, 0.12, 0.85, 10), silM, s * 0.98, 0.5, 0.55, kTorso).rotation.x = 1.45;
    add(new THREE.CylinderGeometry(0.2, 0.18, 1.0, 10), silM, s * 0.3, 0.05, 0.55, king).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.17, 0.2, 0.95, 10), silM, s * 0.32, -0.45, 1.02, king);
  }
  add(new THREE.CylinderGeometry(0.62, 0.85, 0.9, 16), silM, 0, -0.35, 0.65, king).scale.z = 0.8;

  // ---------- the gate: the king's boast in giant stone letters (s1 hook, cracked by one sentence)
  const GZ = 30;
  const CR_P = new THREE.Vector3(0.55, 1.95, 0), CR_N = new THREE.Vector3(1, 0.32, 0).normalize();
  const gateBase = (half) => {
    const nrm = half > 0 ? CR_N.clone() : CR_N.clone().negate();
    const plane = new THREE.Plane(nrm, -nrm.dot(CR_P));
    const stoneH = stoneM.clone(); stoneH.clippingPlanes = [new THREE.Plane()]; stoneH.side = THREE.DoubleSide;
    const brassH = brassM.clone(); brassH.clippingPlanes = stoneH.clippingPlanes;
    const G = new THREE.Group();
    const top = carve(F900, "MENGHIDUPKAN", 1.05, 0.75, stoneH, { bevel: 0.05 });
    const bot = carve(F900, "MEMATIKAN", 1.2, 0.75, stoneH, { bevel: 0.05 });
    bot.G.position.y = 0.62; top.G.position.y = 2.05; G.add(top.G, bot.G);
    const W = Math.max(top.w, bot.w) + 1.4;
    add(new THREE.BoxGeometry(W, 0.62, 1.6), stoneH, 0, 0.31, 0, G);
    add(new THREE.BoxGeometry(W - 0.6, 0.36, 1.3), stoneH, 0, 1.98, 0, G);
    add(new THREE.BoxGeometry(W - 0.4, 0.08, 1.36), brassH, 0, 1.78, 0, G);
    add(new THREE.BoxGeometry(W + 0.2, 0.08, 1.66), brassH, 0, 0.64, 0, G);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.9, 3.6, 1.5), stoneH, s * (W / 2 - 0.2), 1.8, 0, G);
    G.position.set(0, 0, GZ);
    scene.add(G);
    return { G, base: plane, live: stoneH.clippingPlanes[0], W };
  };
  const gA = gateBase(-1), gB = gateBase(1);
  const crackGlow = new THREE.Mesh(new THREE.BoxGeometry(1, 6.0, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.0, 0.5), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(crackGlow);

  // ---------- Ibrahim's presence: a small clay lamp and sentences carved in light
  const lamp = new THREE.Group(); scene.add(lamp);
  const clayM = new THREE.MeshStandardMaterial({ color: 0x8a5432, roughness: 0.8 });
  add(new THREE.SphereGeometry(0.2, 16, 10), clayM, 0, 0.09, 0, lamp).scale.set(1, 0.45, 0.75);
  add(new THREE.CylinderGeometry(0.035, 0.06, 0.2, 8), clayM, 0.2, 0.12, 0, lamp).rotation.z = 1.2;
  add(new THREE.TorusGeometry(0.06, 0.018, 6, 12), clayM, -0.22, 0.12, 0, lamp).rotation.y = Math.PI / 2;
  const flame = add(new THREE.ConeGeometry(0.035, 0.16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2, 0.8) }), 0.29, 0.24, 0, lamp);
  flame.castShadow = false;
  const flameGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 }));
  scene.add(flameGlow);
  const LAMP_GATE = new THREE.Vector3(-1.3, 0, 36.5), LAMP_HALL = new THREE.Vector3(-5.3, 0, -1.6);

  // a sentence block carved in light, revealed by a moving light-beam (clip plane along local x)
  function lightBlock(lines, { col = 0xffd8a0, ei = 2.6, depth = 0.06, gap = 0.28, solid = null } = {}) {
    const mat = solid || lightMat(col, ei); const plane = new THREE.Plane(); mat.clippingPlanes = [plane];
    const G = new THREE.Group(); let y = 0; let maxW = 0; const rows = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      const [txt, size, F] = lines[i];
      const row = carve(F || F600, txt, size, depth, mat, { bevel: 0.012, sp: 0.07 });
      row.G.position.y = y; G.add(row.G); rows.push(row); maxW = Math.max(maxW, row.w);
      y += size * 0.72 + gap;
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.05, y + 0.4, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.4, 1.6), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    beam.position.y = y / 2 - 0.2; G.add(beam);
    return { G, mat, plane, beam, w: maxW, h: y, rows, base: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0) };
  }
  // u: 0 hidden, 1 fully carved; beam rides the edge while carving
  function carveIn(B, u) {
    const x = -B.w / 2 - 0.1 + (B.w + 0.2) * clamp01(u);
    B.base.constant = x; B.G.updateMatrixWorld(true);
    B.plane.copy(B.base).applyMatrix4(B.G.matrixWorld);
    B.beam.position.x = x; B.beam.material.opacity = u > 0.001 && u < 0.999 ? 1 : 0;
    B.G.visible = u > 0.001;
  }
  // s1: the small decisive sentence on the ground before the lamp
  const hook = lightBlock([["TERBITKAN DARI BARAT", 0.2]], { ei: 2.4, gap: 0.1 });
  hook.G.position.set(-0.6, 0.03, 37.6); hook.G.rotation.x = -1.05; hook.G.rotation.y = 0.12; scene.add(hook.G);
  const hookBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(hookBeam);
  // s3: Ibrahim's sentence block (left, faces the king's block across the aisle)
  const ib = lightBlock([["YANG", 0.5], ["MENGHIDUPKAN", 0.5], ["DAN MEMATIKAN", 0.5]], { gap: 0.3 });
  ib.G.position.set(-3.1, 0.95, -8); ib.G.rotation.y = 0.55; scene.add(ib.G);
  const ibSlab = add(new THREE.BoxGeometry(ib.w + 0.5, 0.1, 0.7), lightMat(0xffc070, 0.9), 0, -0.25, 0, ib.G); ibSlab.castShadow = false;
  // s8: small light line by the lamp
  const jelas = lightBlock([["YANG PALING JELAS", 0.1]], { ei: 1.3, gap: 0.1 });
  jelas.G.position.set(-4.95, 0.5, -2.5); jelas.G.rotation.y = 0.5; scene.add(jelas.G);

  // ---------- s3: the king's word-block (right): heavy brass letters on a stone plinth
  const kbMat = brassM.clone(); const crumPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 99); kbMat.clippingPlanes = [crumPlane];
  const KB = new THREE.Group(); KB.position.set(3.1, 0, -8); KB.rotation.y = -0.55; scene.add(KB);
  const kbTop = carve(F900, "AKU PUN", 1.05, 0.6, kbMat, { bevel: 0.04 });
  const kbBot = carve(F900, "BISA", 1.05, 0.6, kbMat, { bevel: 0.04 });
  kbBot.G.position.y = 0.72; kbTop.G.position.y = 0.72 + 1.05 * 0.72 + 0.28; KB.add(kbTop.G, kbBot.G);
  const KW = Math.max(kbTop.w, kbBot.w) + 0.8;
  const kbPlinth = add(new THREE.BoxGeometry(KW, 0.72, 1.3), stoneM, 0, 0.36, 0, KB);
  add(new THREE.BoxGeometry(KW + 0.1, 0.06, 1.36), brassM, 0, 0.73, 0, KB);
  const KL = [...kbTop.letters, ...kbBot.letters];
  KL.forEach((m) => { m.userData.row = kbTop.letters.includes(m) ? kbTop.G : kbBot.G; });
  const riseT = [tAku, tAku + 0.12, tAku + 0.24, tPun, tPun + 0.1, tPun + 0.2, tBisa, tBisa + 0.1, tBisa + 0.2, tBisa + 0.3];
  const PERM = [7, 3, 9, 0, 6, 1, 4, 8, 2, 5];
  // sand samples from the letters (block-local -> world at home pose)
  KB.updateMatrixWorld(true);
  const NSand = 2600, SAND = [];
  {
    const geos = KL.map((m) => m.geometry.attributes.position);
    for (let i = 0; i < NSand; i++) {
      const li = Math.floor(rnd() * KL.length), m = KL[li], p = geos[li];
      const vi = Math.floor(rnd() * p.count);
      tv.set(p.getX(vi), p.getY(vi), p.getZ(vi));
      m.updateMatrixWorld(true); tv.applyMatrix4(m.matrixWorld);
      SAND.push([tv.x, tv.y, tv.z, rnd(), rnd(), rnd()]);
    }
  }
  const sand = pts(scene, NSand, { color: 0xd8b07a, size: 0.05, add: false, opacity: 1 });
  const pile = add(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), sandM, 0, 0.74, 0, KB);
  pile.scale.set(0.01, 0.01, 0.01);

  // ---------- s4: two faceless prisoner silhouettes at the foot of the dais
  function prisoner() {
    const mat = silM.clone(); mat.transparent = true;
    const G = new THREE.Group();
    add(new THREE.CapsuleGeometry(0.26, 0.62, 6, 12), mat, 0, 1.18, 0, G).scale.set(1, 1, 0.75);
    add(new THREE.SphereGeometry(0.18, 14, 10), mat, 0, 1.72, 0, G);
    add(new THREE.CapsuleGeometry(0.1, 0.4, 4, 8), mat, -0.29, 1.12, -0.06, G).rotation.x = 0.25;
    add(new THREE.CapsuleGeometry(0.1, 0.4, 4, 8), mat, 0.29, 1.12, -0.06, G).rotation.x = 0.25;
    const legs = [-1, 1].map((s) => { const piv = new THREE.Group(); piv.position.set(s * 0.12, 0.82, 0); G.add(piv); add(new THREE.CapsuleGeometry(0.1, 0.62, 4, 8), mat, 0, -0.4, 0, piv); return piv; });
    scene.add(G);
    return { G, mat, legs };
  }
  const pr1 = prisoner(), pr2 = prisoner();
  const shackle = add(new THREE.TorusGeometry(0.14, 0.03, 8, 20), new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.4, metalness: 0.9 }), 0, -5, 0);
  const prL = new THREE.SpotLight(0xffd0a0, 0, 16, 0.5, 0.7, 1.2); prL.position.set(0, 9, -12); prL.target.position.set(0, 0.5, -16.5); scene.add(prL); scene.add(prL.target);

  // ---------- s5: two stepped pedestals in the desert carrying the challenge (west) and the sunrise (east)
  const PDZ = -50;
  function pedestal(x) {
    const G = new THREE.Group(); G.position.set(x, 0, PDZ); scene.add(G);
    add(new THREE.BoxGeometry(6.8, 2.6, 4.2), stoneM, 0, 1.3, 0, G);
    add(new THREE.BoxGeometry(6.2, 2.6, 3.4), stoneM, 0, 3.9, 0, G);
    add(new THREE.BoxGeometry(5.6, 2.6, 2.8), stoneM, 0, 6.5, 0, G);
    add(new THREE.BoxGeometry(5.8, 0.12, 2.9), basaltM, 0, 7.85, 0, G);
    return G;
  }
  const pW = pedestal(-3.7), pE = pedestal(3.7);
  const west = lightBlock([["TERBITKAN", 0.7], ["DARI", 0.7], ["BARAT", 1.3]], { col: 0xe8e4ff, ei: 2.0, depth: 0.25, gap: 0.3 });
  west.G.position.set(-3.7, 8.05, PDZ + 0.6); west.G.rotation.y = 0.08; scene.add(west.G);
  const east = lightBlock([["DARI", 0.7], ["TIMUR", 1.3]], { depth: 0.4, gap: 0.3, solid: new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.45, metalness: 0.6, emissive: 0x5a3610 }) });
  east.G.position.set(3.7, 8.05, PDZ + 0.6); east.G.rotation.y = -0.08; scene.add(east.G);
  const pedL = [-3.7, 3.7].map((x) => { const l = new THREE.PointLight(0xffd8a8, 0, 14, 1.2); l.position.set(x, 9.5, PDZ + 4); scene.add(l); return l; });

  // ---------- volumetric god-rays (crossed additive cards with a soft core)
  const rayTex = canvasTex(64, 256, (x, w, h) => {
    const img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = (i + 0.5) / w - 0.5, v = j / h;
      const a = Math.exp(-u * u * 18) * Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.05)), 0.8) * (1 - 0.55 * v);
      const k = (j * w + i) * 4; img.data[k] = 255; img.data[k + 1] = 255; img.data[k + 2] = 255; img.data[k + 3] = Math.round(255 * Math.max(0, a));
    }
    x.putImageData(img, 0, 0);
  });
  function rays(list, color) {
    const mat = new THREE.MeshBasicMaterial({ map: rayTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    for (const [x, y, z, dx, dy, dz, len, wid] of list) {
      const G = new THREE.Group(); const d = new THREE.Vector3(dx, dy, dz).normalize();
      for (let k = 0; k < 3; k++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(wid, len), mat); pl.rotation.y = (k * Math.PI) / 3; pl.position.y = -len / 2; G.add(pl); }
      G.position.set(x, y, z); G.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d); scene.add(G);
    }
    return mat;
  }
  const winRays = rays([15, 8, 1, -6, -13, -20, -27].map((z) => [-10.6, 13.6, z, 0.72, -0.66, -0.12, 22, 2.2]), new THREE.Color(1.0, 0.72, 0.42));
  const gateRays = rays([[-6, 16, 33, 0.3, -1, -0.15, 20, 3.2], [4, 17, 34, -0.15, -1, -0.2, 20, 2.6], [12, 16, 32, -0.4, -1, -0.05, 20, 3]], new THREE.Color(0.85, 0.7, 0.55));
  const sunRays = rays([[-4.5, 12, -31, -0.08, -0.32, 1, 38, 3.4], [-0.5, 10.5, -31, 0.02, -0.28, 1, 40, 4.2], [3.5, 12.5, -31, 0.1, -0.34, 1, 36, 3.2], [6, 8, -31, 0.08, -0.2, 1, 30, 2.6]], new THREE.Color(1.0, 0.66, 0.34));

  // ---------- particles
  const NM = 900, motes = pts(scene, NM, { color: 0xffe0b0, size: 0.06, add: true, opacity: 0.9 });
  const MS = Array.from({ length: NM }, () => [rnd(), rnd(), rnd(), rnd()]);
  const ND = 360, dust = pts(scene, ND, { color: 0xd9b88a, size: 0.12, add: false, opacity: 0.8 });
  const DS = Array.from({ length: ND }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- camera spline [t, px,py,pz, tx,ty,tz]
  const camKeys = [
    [0, -0.6, 1.1, 73, 0.4, 2.0, 30],
    [tCr - 0.4, -0.4, 1.2, 55, 0.6, 2.0, 30],
    [tCr + 1.0, 0.45, 1.7, 40, 0.5, 1.95, 24],
    [K.s2, 0.45, 2.0, 27.5, 0.2, 2.8, 0],
    [K.s2 + 3, 0.3, 3.3, 16, 0, 3.6, -20],
    [tKer, 0.8, 3.7, 6, 0, 3.6, -24],
    [K.s3 - 0.1, 0.4, 3.4, 2.0, 0, 3.4, -24],
    [tYang, -1.0, 2.4, 5.5, -3.1, 2.0, -8],
    [tRaja, -0.7, 2.6, 7.5, -2.6, 2.0, -8],
    [tAku - 0.5, 0, 3.0, 21.5, 0.1, 1.8, -8],
    [tBisa + 0.6, 0, 3.2, 22.0, 0.1, 1.8, -8],
    [K.s3e + 0.2, 0, 17.0, 12.5, 0, 0.6, -9],
    [K.s4 + 1.6, 0, 3.2, -1.0, 0, 2.0, -18],
    [tBeb + 0.4, 0.4, 2.5, -4.2, 0.6, 1.4, -17],
    [tMain - 0.9, -3.4, 3.2, 12.0, 2.9, 1.8, -8],
    [tMain - 0.3, -3.45, 3.2, 12.15, 2.9, 1.8, -8],
    [K.s4e - 0.3, -3.6, 3.3, 12.6, 2.9, 1.85, -8],
    [K.s4e + 0.4, 0, 9.0, 8.0, 0, 9.6, -40],
    [K.s5 + 2.6, 0, 8.3, -11.5, 0, 10.2, -50],
    [K.s5e, 0, 8.4, -13.6, 0, 10.0, -50],
    [K.s6 + 1.0, 0, 8.4, -14.0, 0, 10.0, -50],
    [tKuasa + 1.2, -0.5, 5.4, 18.5, 0, 4.9, -40],
    [tGes, -0.5, 5.5, 20.0, 0, 4.8, -40],
    [K.s6e, -0.45, 5.5, 20.6, 0, 4.7, -40],
    [K.s7 + 2.0, 0.65, 2.75, 7.6, -3.1, 2.0, -8],
    [K.s7 + 2.8, 0.6, 2.7, 7.4, -3.1, 2.0, -8],
    [K.s7e - 0.6, 0.45, 2.55, 6.8, -3.1, 2.0, -8],
    [K.s7e, 0.4, 2.5, 6.6, -3.15, 2.0, -8],
    [K.s8 + 2.6, -2.2, 1.35, 5.2, -5.6, 0.7, -2.2],
    [K.end, -2.6, 1.2, 4.6, -5.8, 0.6, -2.4],
    [K.dur, -2.62, 1.2, 4.55, -5.8, 0.6, -2.4],
  ];
  const camT = track(camKeys);

  // ---------- frame
  return (t) => {
    const [px, py, pz, tx, ty, tz] = camT(t);
    // tiny settle shake on the crack and on each heavy letter landing
    let sh = 0.06 * Math.exp(-Math.max(0, t - tCr) * 4) * (t > tCr ? 1 : 0);
    for (const rt of [tAku, tPun, tBisa]) if (t > rt + 0.35) sh += 0.03 * Math.exp(-(t - rt - 0.35) * 6);
    cam.position.set(px + sh * Math.sin(t * 61), py + sh * Math.sin(t * 47 + 1), pz);
    cam.lookAt(tx, ty, tz);

    // sun and dawn
    const up = ramp(t, tMat - 0.2, tBar + 1.6), up2 = ramp(t, tBar + 1.6, K.dur);
    const el = -0.085 + 0.13 * up + 0.04 * up2;
    tv.set(0.1, Math.tan(el), -1).normalize();
    sun.position.copy(SUN_O).addScaledVector(tv, 420);
    sunGlow.position.copy(sun.position).addScaledVector(tv, -2); sunGlow.lookAt(cam.position); sunGlow.scale.setScalar(60 + 15 * up);
    sunGlow.material.opacity = 0.3 * ramp(t, tMat - 0.4, tTim + 0.5);
    skyU.uSun.value.copy(tv); skyU.uDawn.value = 0.3 * ramp(t, K.s5 + 1.0, K.s5 + 4.0) + 0.7 * ramp(t, tMat - 0.6, tTim + 1.0); skyU.uDay.value = 0.35 * up2;
    sunL.intensity = 3.0 * ramp(t, tTim - 0.4, tBar + 1.0);
    sunL.position.set(4, 8 + 30 * Math.max(0.05, Math.tan(el + 0.25)), -70); sunL.target.position.set(0, 0, -6);
    const dawn = skyU.uDawn.value;
    for (let i = 0; i < NS; i++) {
      const s = SD[i]; const dd = s[0] - Math.atan2(tv.x, -tv.z);
      const fade = 1 - dawn * Math.exp(-dd * dd / 0.12) * 0.95 - 0.25 * up2;
      const b = s[2] * (0.75 + 0.25 * Math.sin(t * 2.2 + s[3])) * Math.max(0, fade);
      stars.col[i * 3] = b * 0.9; stars.col[i * 3 + 1] = b * 0.92; stars.col[i * 3 + 2] = b;
    }
    stars.commit();
    scene.fog.color.setRGB(mix(0.03, 0.075, dawn), mix(0.025, 0.045, dawn), mix(0.04, 0.04, dawn));
    scene.fog.density = mix(0.011, 0.007, dawn);
    hemi.intensity = 0.5 + 0.35 * dawn; hemi.color.setRGB(mix(0.29, 0.62, dawn), mix(0.24, 0.42, dawn), mix(0.35, 0.3, dawn));
    key.intensity = 1.5 * (1 - 0.6 * dawn);
    rim.intensity = 0.5 + 0.6 * dawn;

    // god-rays
    winRays.opacity = (0.045 + 0.01 * Math.sin(t * 0.7)) * ramp(t, K.s2 - 1.2, K.s2 + 0.8) * (1 - 0.5 * dawn);
    gateRays.opacity = 0.035 * (1 - ramp(t, K.s2 - 0.6, K.s2 + 0.6));
    sunRays.opacity = 0.055 * ramp(t, tTim, tBar + 2.0);

    // gate crack
    const op = eout((t - tCr) / 0.9);
    gA.G.position.set(-1.7 * op, -0.06 * op, GZ); gA.G.rotation.z = 0.035 * op;
    gB.G.position.set(1.7 * op, 0, GZ); gB.G.rotation.z = -0.025 * op;
    for (const g of [gA, gB]) { g.G.updateMatrixWorld(true); g.live.copy(g.base).applyMatrix4(g.G.matrixWorld); }
    const glowU = ramp(t, tCr - 0.55, tCr) * (1 - ramp(t, tCr + 1.6, K.s2 + 1.5));
    crackGlow.material.opacity = 0.55 * glowU * (1 - ramp(t, tCr + 0.5, tCr + 1.1));
    crackGlow.position.set(CR_P.x - 0.1, CR_P.y, GZ); crackGlow.rotation.z = Math.atan2(CR_N.y, CR_N.x);
    crackGlow.scale.set(0.04 + 0.35 * op, 1, 0.3);
    gateL.intensity = 14 * glowU;
    gateF.intensity = 260 * (1 - ramp(t, K.s2, K.s2 + 1));
    const gVis = t < K.s2 + 2; gA.G.visible = gB.G.visible = gVis;

    // lamp (gate in s1, hall from s2)
    const inHall = t >= K.s2;
    lamp.position.copy(inHall ? LAMP_HALL : LAMP_GATE); lamp.rotation.y = inHall ? 0.9 : 0.3;
    const lampOn = inHall ? ramp(t, K.s3 - 1, K.s3 + 0.4) : ramp(t, tSat - 0.6, tSat + 0.2);
    const fl = 1 + 0.08 * Math.sin(t * 13.1) + 0.05 * Math.sin(t * 29.7 + 1.3) + 0.03 * Math.sin(t * 51.3);
    flame.scale.set(1, (0.85 + 0.25 * (fl - 1) * 4) * Math.max(0.001, lampOn), 1);
    flame.updateMatrixWorld(true); flame.getWorldPosition(tv2);
    lampL.position.copy(tv2).add(tv.set(0, 0.25, 0)); lampL.intensity = 5 * lampOn * fl * (inHall ? 1 + 0.6 * ramp(t, K.s8, K.s8 + 2) : 1);
    flameGlow.position.copy(tv2).add(tv.set(0, 0.06, 0)); flameGlow.lookAt(cam.position); flameGlow.scale.setScalar(0.9 * lampOn * fl); flameGlow.material.opacity = 0.85 * lampOn;

    // s1 decisive sentence + its beam up to the crack
    carveIn(hook, ramp(t, tSat, tSat + 1.1) * (1 - ramp(t, K.s2 + 0.5, K.s2 + 0.8)));
    const hb = ramp(t, tCr - 0.75, tCr - 0.25) * (1 - ramp(t, tCr + 0.3, tCr + 0.9));
    tv.set(-0.6, 0.15, 37.4); tv2.set(CR_P.x, CR_P.y, GZ + 0.6);
    const hl = tv.distanceTo(tv2) * Math.max(0.001, hb);
    const hd = tv2.clone().sub(tv).normalize();
    hookBeam.position.copy(tv).addScaledVector(hd, hl / 2); hookBeam.scale.set(1, hl, 1);
    hookBeam.quaternion.setFromUnitVectors(UP, hd); hookBeam.material.opacity = hb > 0.001 ? 0.95 : 0;

    // throne light + king
    throneL.intensity = 90 * ramp(t, K.s2 - 0.5, K.s2 + 2.5) * (1 - 0.85 * ramp(t, K.s5, K.s5 + 2) + 0.35 * ramp(t, tKuasa, tKuasa + 2));
    crown.children[0].material.emissiveIntensity = 0.4 + 1.2 * Math.exp(-Math.pow((t - tKer - 0.3) / 0.45, 2));
    const bow = ramp(t, tBing, tBing + 1.6);
    kHead.rotation.x = 0.22 * bow; kTorso.rotation.x = 0.06 * bow;

    // Ibrahim's sentence block: carved in by a light beam when he speaks
    carveIn(ib, ramp(t, tYang - 0.1, tYang + 1.5));
    ib.mat.emissiveIntensity = 2.4 + 0.8 * ramp(t, K.s7, K.s7 + 2) + 0.3 * Math.sin(t * 1.3);
    blockL.intensity = 9 * ramp(t, tYang, tYang + 1.2) * (1 + 0.4 * ramp(t, K.s7, K.s7 + 2));
    carveIn(jelas, ramp(t, tPal - 0.2, tJel + 0.4));

    // king's block: rise, shuffle (playing with words), crumble to sand
    KB.visible = t > tSom - 0.5;
    kbL.intensity = 26 * ramp(t, tSom, tSom + 1) * (1 - ramp(t, tCrum0 + dCrum, tCrum0 + dCrum + 1.5));
    kbPlinth.position.y = 0.36 - 1.2 * (1 - eout((t - tSom + 0.3) / 0.7));
    const shu = ramp(t, tMain - 0.1, tMain + 0.7) * (1 - ramp(t, tPert + 0.3, tPert + 1.0));
    for (let i = 0; i < KL.length; i++) {
      const m = KL[i], h = m.userData.home;
      const rise = back((t - riseT[i]) / 0.5, 1.2);
      // shuffle target: the home slot of another letter (in block space via its row)
      const tgt = KL[PERM[i]];
      tv.copy(tgt.userData.home).add(tgt.userData.row.position).sub(m.userData.row.position);
      const arc = Math.sin(Math.PI * shu) * 0.9 * (i % 2 ? 1 : -0.6);
      m.position.set(mix(h.x, tv.x, shu), mix(h.y, tv.y, shu) - 3.4 * (1 - rise) + arc, h.z + Math.sin(Math.PI * shu) * 0.5);
      m.rotation.set(0, 0, Math.sin(Math.PI * shu) * 0.25 * (i % 3 - 1));
      m.visible = t > riseT[i] - 0.05;
    }
    const hC = 3.6 - 3.0 * sm((t - tCrum0) / dCrum);
    crumPlane.constant = t < tCrum0 ? 99 : hC;
    for (let i = 0; i < NSand; i++) {
      const s = SAND[i];
      const tr = tCrum0 + dCrum * clamp01(1 - (s[1] - 0.6) / 3.0) * 1.0 - 0.15 + s[3] * 0.25;
      const tau = t - tr;
      if (t < tCrum0 || tau < 0) { sand.pos[i * 3 + 1] = -50; continue; }
      const floorY = 0.75 + 0.35 * s[5];
      const y = Math.max(floorY, s[1] - 1.2 * tau - 2.6 * tau * tau);
      const land = clamp01((s[1] - y) / Math.max(0.001, s[1] - floorY));
      sand.pos[i * 3] = s[0] + (0.5 * tau + (s[4] - 0.5) * 0.7) * Math.min(1, tau * 2) * (1 - 0.6 * land) + 0.05 * Math.sin(t * 3 + s[3] * 9) * (1 - land);
      sand.pos[i * 3 + 1] = y;
      sand.pos[i * 3 + 2] = s[2] + (s[5] - 0.5) * 0.6 * Math.min(1, tau * 2);
      const c = 0.75 + 0.25 * s[4]; sand.col[i * 3] = c * 0.85; sand.col[i * 3 + 1] = c * 0.66; sand.col[i * 3 + 2] = c * 0.44;
    }
    sand.commit();
    const pg = ramp(t, tCrum0 + 0.4, tCrum0 + dCrum + 0.8);
    pile.scale.set(Math.max(0.01, (KW / 2 - 0.1) * pg), Math.max(0.01, 0.55 * pg), Math.max(0.01, 0.62 * pg));

    // prisoners: one fades into darkness, one walks out free
    const pIn = ramp(t, tMem - 0.2, tMem + 0.6) * (1 - ramp(t, K.s4e - 0.6, K.s4e));
    prL.intensity = 45 * pIn;
    const f1 = 1 - ramp(t, tEks + 0.1, tEks + 1.5);
    pr1.G.position.set(-1.2, -0.25 * (1 - f1), -16.2); pr1.mat.opacity = pIn * f1; pr1.G.visible = pIn * f1 > 0.01;
    const wk = ramp(t, tBeb + 0.3, tBeb + 3.4);
    const wx = mix(1.2, 5.2, wk), wz = mix(-16.2, -12.2, wk);
    pr2.G.position.set(wx, 0, wz); pr2.G.rotation.y = wk > 0 ? mix(0, 0.8, ramp(t, tBeb + 0.1, tBeb + 0.6)) : 0;
    const sw = Math.sin((t - tBeb) * 7) * 0.45 * (wk > 0 && wk < 1 ? 1 : 0);
    pr2.legs[0].rotation.x = sw; pr2.legs[1].rotation.x = -sw;
    pr2.mat.opacity = pIn * (1 - ramp(t, tBeb + 2.6, tBeb + 3.6)); pr2.G.visible = pr2.mat.opacity > 0.01;
    pr1.legs.forEach((l) => (l.rotation.x = 0));
    const shk = ramp(t, tBeb, tBeb + 0.45);
    shackle.position.set(1.2, t < tBeb - 0.01 ? -5 : mix(1.05, 0.04, shk * shk), -16.0); shackle.rotation.set(mix(0.3, Math.PI / 2, shk), 0, 0.4);
    shackle.visible = t > tBeb - 0.01 && t < K.s4e;

    // s5 words: east first (with the sun), then the challenge on the west
    carveIn(east, ramp(t, K.s5 + 1.4, K.s5 + 2.6));
    carveIn(west, ramp(t, K.s5 + 1.9, K.s5 + 3.3));
    pedL.forEach((l, i) => (l.intensity = 30 * ramp(t, K.s5 + 1.4 + i * 0.5, K.s5 + 2.6 + i * 0.5)));
    west.mat.emissiveIntensity = 1.8 + 0.3 * Math.sin(t * 1.1);

    // motes in the hall (and around the camera look target), brighter in the light
    const lx = tx, ly = Math.max(1.5, ty), lz = tz;
    const Bx = 7, By = 5, Bz = 9;
    for (let i = 0; i < NM; i++) {
      const s = MS[i];
      const wx2 = ((s[0] * Bx * 2 + t * 0.05 * (s[3] - 0.3) - lx) % (Bx * 2) + Bx * 4) % (Bx * 2) - Bx;
      const wy2 = ((s[1] * By * 2 + t * 0.03 - ly) % (By * 2) + By * 4) % (By * 2) - By;
      const wz2 = ((s[2] * Bz * 2 + t * 0.04 - lz) % (Bz * 2) + Bz * 4) % (Bz * 2) - Bz;
      motes.pos[i * 3] = lx + wx2; motes.pos[i * 3 + 1] = Math.max(0.1, ly + wy2); motes.pos[i * 3 + 2] = lz + wz2 * 0.8 + 4;
      const tw = (0.3 + 0.35 * Math.sin(t * (0.8 + s[3] * 1.6) + s[0] * 40)) * (0.7 + 0.6 * dawn);
      motes.col[i * 3] = tw; motes.col[i * 3 + 1] = tw * 0.8; motes.col[i * 3 + 2] = tw * 0.55;
    }
    motes.commit();
    // dust bursts: gate crack + each rising letter
    for (let i = 0; i < ND; i++) {
      const s = DS[i]; let px2 = 0, py2 = -50, pz2 = 0, a = 0;
      if (i < 160) {
        const tau = t - tCr;
        if (tau > 0 && tau < 3) { px2 = CR_P.x + (s[0] - 0.5) * 3.5 * (0.3 + tau); py2 = CR_P.y + (s[1] - 0.5) * 4 + tau * 0.3 - tau * tau * 0.25; pz2 = GZ + 0.8 + s[2] * 2 * tau; a = 1 - tau / 3; }
      } else {
        const k = (i - 160) % 3, rt = [tAku, tPun, tBisa][k] + 0.3, tau = t - rt;
        if (tau > 0 && tau < 2.5) {
          tv.set((s[0] - 0.5) * 6, 0.1 + s[1] * 0.5 * tau, 0.9 + s[2] * 1.4 * tau); tv.applyQuaternion(KB.quaternion).add(KB.position);
          px2 = tv.x; py2 = tv.y; pz2 = tv.z; a = 1 - tau / 2.5;
        }
      }
      dust.pos[i * 3] = px2; dust.pos[i * 3 + 1] = py2; dust.pos[i * 3 + 2] = pz2;
      dust.col[i * 3] = 0.8 * a; dust.col[i * 3 + 1] = 0.68 * a; dust.col[i * 3 + 2] = 0.5 * a;
    }
    dust.commit();

    bp.strength = 0.42 + 0.15 * glowU - 0.14 * dawn; bp.threshold = 0.82 + 0.08 * dawn;
    comp.render();
  };
}
