// EP12 DUA PUTRA ADAM DAN SEEKOR GAGAK. FILMNOIR: black-and-white chiaroscuro, hard key light, long shadows, grain.
// The only colour in the film is deep ember red, and only for the offering fire (s2) and its last embers.
// The two sons of Adam are faceless dark silhouettes; from s3 the story plays as their shadows on a rock wall,
// thrown by a low hard spot. The killing is never shown: an iris closes (HTML layer), one shadow is gone, a staff falls.
// The crow (s6) is the hero shot: feathered body, jointed wings, scratching feet, a hollow that deepens with time.
// World: altars at x=+-4.2 z=-4, rock wall at z=-14, spot at (0,0.5,2.5), dig site D, AUDIRA carved stone at the plain edge.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

const D = { x: 0.45, z: -5.9 };            // the crow's hollow
const STONE = { x: -6.4, z: 2.6 };          // AUDIRA carved stone
const ALT_Q = { x: -2.2, z: -4.0 }, ALT_H = { x: 2.2, z: -4.0 };
const WALL_Z = -14;
const LIGHT = new THREE.Vector3(0, 0.5, 2.5);

function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

// flat stage around the story, rough plain beyond, far ridges
function H(x, z) {
  const d = Math.hypot(x / 16, (z + 3) / 13);
  const wild = sm((d - 0.7) / 0.8);
  let h = (fbm(x * 0.08, z * 0.08) - 0.5) * (0.06 + 1.6 * wild);
  h += wild * (fbm(x * 0.02 + 4, z * 0.02) - 0.4) * 5;
  const far = Math.hypot(x, z + 4);
  h += sm((far - 70) / 90) * fbm(x * 0.012, z * 0.012 + 3) * 38;
  return h * sm((Math.hypot(x - D.x, z - D.z) - 0.8) / 1.5);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x161616, fog: 0.018, exp: 1.0, bloom: [0.55, 0.5, 0.82], shadow: true });
  r.shadowMap.type = THREE.PCFShadowMap;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1212);
  envStrips(r, scene, [[30, 4, 0xffffff, 1.4, -40, 30, 30], [60, 3, 0xdddddd, 0.6, 50, 10, -40], [10, 40, 0xffffff, 0.5, 0, 60, 0]], 0x050505);

  // ---------- timing
  const tCaw = A("s1:gagak"), tBury1 = A("s1:mengubur");
  const tAcc = A("s2:diterima"), tNot = A("s2:tidak"), tTrad = A("s2:Tradisi");
  const tThreat = A("s3:membunuhmu"), tCalm = A("s3:tenang");
  const tReach = A("s4:menggerakkan"), tNo = A("s4:tidak"), tFear = A("s4:takut");
  const tLust = A("s5:nafsu"), tKill = A("s5:membunuh"), tLoss = A("s5:rugi");
  const tCrow = A("s6:gagak"), tDig = A("s6:menggali"), tWoe = A("s6:celaka"), tCrow2 = A("s6:gagak#2"), tRegret = A("s6:menyesal");
  const tOne = A("s7:satu"), tAll = A("s7:semua"), tKeep = A("s7:memelihara"), tOne2 = A("s7:satu#2"), tAll2 = A("s7:semua#2");
  const tKisah = A("s8:Kisah");
  // iris: closed from tKill to tOpen (HTML iris in build-video.mjs uses the same keys)
  const tShut = tKill + 0.3, tOpen = tKill + 1.05;
  const tLand = tCrow + 0.75, tDig0 = tDig + 0.15, tDig1 = K.s7 + 1.2;
  const tFly = tKisah - 1.6;

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xbfbfbf, 0x101010, 0.3); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  scene.add(key); scene.add(key.target);
  const KEYDIR = new THREE.Vector3(-0.72, 0.36, 0.6).normalize();
  const rim = new THREE.DirectionalLight(0xffffff, 0.9); rim.position.set(30, 22, -40); scene.add(rim);
  const spot = new THREE.SpotLight(0xffffff, 0, 60, 0.62, 0.35, 0);
  spot.position.copy(LIGHT); spot.target.position.set(0, 1.4, WALL_Z); scene.add(spot); scene.add(spot.target);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.camera.near = 0.3; spot.shadow.camera.far = 30; spot.shadow.bias = -0.0003; spot.shadow.normalBias = 0.02;
  const fireL = new THREE.PointLight(0xff2a10, 0, 22, 1.6); fireL.position.set(ALT_H.x, 2.0, ALT_H.z + 0.6); scene.add(fireL);
  const crowL = new THREE.SpotLight(0xffffff, 0, 8, 0.5, 1, 0); crowL.position.set(D.x + 2.5, 2.6, D.z + 1.8); crowL.target.position.set(D.x, 0.15, D.z); scene.add(crowL); scene.add(crowL.target);

  // ---------- sky: charcoal gradient with slow cloud bands
  const SU = { uT: { value: 0 }, uHor: { value: new THREE.Color(0x2a2a2a) }, uTop: { value: new THREE.Color(0x050505) }, uMoon: { value: new THREE.Vector3(-0.5, 0.42, -0.75).normalize() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(850, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uMoon;uniform float uT;varying vec3 vD;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p*=2.02;a*=.5;}return s;}
void main(){vec3 d=normalize(vD);float e=d.y;
 vec3 c=mix(uHor,uTop,smoothstep(-.02,.5,e));
 vec2 q=d.xz/(e+.25)*1.6+vec2(uT*.02,0.);
 float cl=fb(q);c=mix(c,uHor*1.5,smoothstep(.5,.85,cl)*smoothstep(0.,.25,e)*.55);
 c=mix(c,c*.45,smoothstep(.55,.35,cl)*smoothstep(.05,.3,e)*.5);
 float m=max(dot(d,uMoon),0.);c+=vec3(.9)*smoothstep(.9994,.9997,m)+vec3(.25)*pow(m,60.)+vec3(.08)*pow(m,6.);
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // ---------- textures
  const grit = canvasTex(512, 512, (g, w, h) => {
    const rr = mulberry(77); g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 90 + rr() * 90 | 0; g.fillStyle = `rgba(${v},${v},${v},${0.25 + rr() * 0.4})`; const s = 1 + rr() * 4; g.fillRect(rr() * w, rr() * h, s, s); }
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(40,40,40,${0.2 + rr() * 0.3})`; g.lineWidth = 1 + rr() * 2; g.beginPath(); let x = rr() * w, y = rr() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rr() - .5) * 60; y += (rr() - .5) * 60; g.lineTo(x, y); } g.stroke(); }
  }, [60, 60]);
  const rockBump = canvasTex(512, 512, (g, w, h) => {
    const rr = mulberry(91); g.fillStyle = "#777"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const v = 95 + rr() * 60 | 0; g.fillStyle = `rgba(${v},${v},${v},.22)`; g.beginPath(); g.ellipse(rr() * w, rr() * h, 3 + rr() * 16, 2 + rr() * 9, rr() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(30,30,30,${0.12 + rr() * 0.15})`; g.lineWidth = 1 + rr() * 1.2; g.beginPath(); let x = rr() * w, y = rr() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rr() - .5) * 40; y += rr() * 50; g.lineTo(x, y); } g.stroke(); }
  }, [18, 7]);

  // ---------- terrain (a disc of the plain is cut out at D, where the hollow mesh lives)
  const tg = new THREE.PlaneGeometry(520, 520, 260, 260); tg.rotateX(-Math.PI / 2);
  { const p = tg.attributes.position; const col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = H(x, z); p.setY(i, h); const v = 0.42 + 0.22 * fbm(x * 0.15, z * 0.15) - 0.1 * clamp01(h / 6); col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = v; }
    tg.setAttribute("color", new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals(); }
  const groundM = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.97, map: grit, vertexColors: true, bumpMap: grit, bumpScale: 1.2 });
  groundM.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;").replace("void main() {", `void main() {\nif(length((vWP.xz-vec2(${D.x.toFixed(3)},${D.z.toFixed(3)}))*vec2(1.,1.25))<0.40)discard;`);
  };
  groundM.customProgramCacheKey = () => "ep12-ground-hole";
  const ground = new THREE.Mesh(tg, groundM); ground.receiveShadow = true; scene.add(ground);

  // the hollow: a lid that deepens into a pit with a raised rim of loose earth
  const HR = 24, HS = 40, HRAD = 0.62;
  const hg = new THREE.BufferGeometry();
  const hpos = new Float32Array((HR + 1) * HS * 3 + 3), hcol = new Float32Array((HR + 1) * HS * 3 + 3), hidx = [];
  for (let j = 0; j < HR; j++) for (let i = 0; i < HS; i++) {
    const a = j * HS + i, b = j * HS + (i + 1) % HS, c = (j + 1) * HS + i, d = (j + 1) * HS + (i + 1) % HS;
    hidx.push(a, c, b, b, c, d);
  }
  const HC = (HR + 1) * HS; for (let i = 0; i < HS; i++) hidx.push(HC, i, (i + 1) % HS);
  hg.setAttribute("position", new THREE.BufferAttribute(hpos, 3)); hg.setAttribute("color", new THREE.BufferAttribute(hcol, 3)); hg.setIndex(hidx.reverse());
  const hollow = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: 0x8a8a8a, side: THREE.DoubleSide, vertexColors: true, roughness: 1, map: grit, bumpMap: grit, bumpScale: 0.8 }));
  hollow.receiveShadow = true; hollow.position.set(D.x, 0.002, D.z); scene.add(hollow);
  const hjit = Array.from({ length: (HR + 1) * HS }, (_, i) => hash(i * 0.37, 1.3) - 0.5);
  function setHollow(dep) {
    for (let j = 0; j <= HR; j++) {
      const rr = (j + 1) / (HR + 1);
      for (let i = 0; i < HS; i++) {
        const k = j * HS + i, a = (i / HS) * Math.PI * 2, rad = rr * HRAD;
        const x = Math.cos(a) * rad, z = Math.sin(a) * rad / 1.25;
        const pit = Math.max(0, 1 - Math.pow(rr / 0.55, 2));
        const rimb = Math.exp(-Math.pow((rr - 0.68) / 0.13, 2));
        let y = -0.2 * dep * pit + 0.06 * dep * rimb * (1 + 0.6 * hjit[k]) + 0.006 * hjit[k] * dep;
        if (j === HR) y = 0;
        hpos[k * 3] = x; hpos[k * 3 + 1] = y; hpos[k * 3 + 2] = z;
        const v = (0.5 - 0.47 * pit * dep + 0.08 * rimb * dep) * (1 + 0.15 * hjit[k]);
        hcol[k * 3] = hcol[k * 3 + 1] = hcol[k * 3 + 2] = Math.max(0.03, v);
      }
    }
    hpos[HC * 3 + 1] = -0.2 * dep; hcol[HC * 3] = hcol[HC * 3 + 1] = hcol[HC * 3 + 2] = Math.max(0.03, 0.5 - 0.47 * dep);
    hg.attributes.position.needsUpdate = true; hg.attributes.color.needsUpdate = true; hg.computeVertexNormals();
  }
  setHollow(0);

  // ---------- rock wall
  const wg = new THREE.PlaneGeometry(110, 40, 330, 120);
  { const p = wg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y0 = p.getY(i) + 18;
      const ridge = 15 + 9 * fbm(x * 0.05, 3.1) + 6 * Math.abs(x) / 55;
      let z = (fbm(x * 0.35, y0 * 0.35) - 0.5) * 0.5 * (0.4 + 1.6 * sm((Math.abs(x) - 4) / 10)) + (fbm(x * 0.06, y0 * 0.06) - 0.5) * 2.2 * sm((Math.abs(x) - 5) / 12);
      z += Math.pow(Math.max(0, Math.abs(x) - 16) / 30, 2) * 18; // ends curve toward the viewer
      if (y0 > ridge) z -= (y0 - ridge) * 2.2;
      p.setXYZ(i, x, y0, z);
    }
    wg.computeVertexNormals(); }
  const wall = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: 0x9a9a96, roughness: 0.95, map: rockBump, bumpMap: rockBump, bumpScale: 1.4 }));
  wall.position.set(0, -2, WALL_Z); wall.receiveShadow = true; wall.castShadow = true; scene.add(wall);

  // ---------- scattered rocks
  const rockM = new THREE.MeshStandardMaterial({ color: 0x7a7a78, roughness: 0.92, flatShading: true, map: rockBump });
  const rg = new THREE.DodecahedronGeometry(1, 0);
  const NR = 260, rocks = new THREE.InstancedMesh(rg, rockM, NR); rocks.castShadow = rocks.receiveShadow = true;
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (let i = 0; i < NR; i++) {
      let x, z; do { x = (rnd() - 0.5) * 120; z = -13 + rnd() * 90 - 20 * rnd(); } while (Math.abs(x) < 7 && z > -13 && z < 5);
      const sc = 0.15 + Math.pow(rnd(), 3) * 1.6;
      m.compose(v.set(x, H(x, z) + sc * 0.2, z), q.setFromEuler(e.set(rnd() * 3, rnd() * 3, rnd() * 3)), s.set(sc * (1 + rnd()), sc * (0.5 + rnd() * 0.5), sc * (1 + rnd() * 0.6)));
      rocks.setMatrixAt(i, m);
    } }
  scene.add(rocks);
  // pebbles on the stage
  const peb = new THREE.InstancedMesh(rg, rockM, 140); peb.castShadow = peb.receiveShadow = true;
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (let i = 0; i < 140; i++) { let x, z; do { x = (rnd() - 0.5) * 16; z = -13 + rnd() * 18; } while (Math.hypot(x - D.x, z - D.z) < 0.9 || (x > 0.2 && x < 2.8 && z > -5 && z < -1.2)); const sc = 0.03 + rnd() * 0.08; m.compose(v.set(x, sc * 0.3, z), q.setFromEuler(e.set(rnd() * 3, rnd() * 3, rnd() * 3)), s.set(sc, sc * 0.6, sc * 1.2)); peb.setMatrixAt(i, m); } }
  scene.add(peb);

  // ---------- altars: cairns of flat stones
  const stoneGeo = (seed, sx, sy, sz) => {
    const g = new THREE.IcosahedronGeometry(1, 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + (hash(x * 3 + seed, z * 3 + y * 7) - 0.5) * 0.28; p.setXYZ(i, x * sx * n, Math.max(-0.7, Math.min(0.7, y)) * sy * n, z * sz * n); }
    g.computeVertexNormals(); return g;
  };
  const altarM = new THREE.MeshStandardMaterial({ color: 0x8c8c88, roughness: 0.9, flatShading: true, map: rockBump });
  function altar(c, seed) {
    const G = new THREE.Group(); G.position.set(c.x, 0, c.z);
    const L = [[0.9, 0.32, 0.75, 0.2], [0.78, 0.3, 0.66, 0.6], [0.72, 0.18, 0.62, 0.92]];
    L.forEach(([sx, sy, sz, y], i) => { const m = new THREE.Mesh(stoneGeo(seed + i, sx, sy, sz), altarM); m.position.y = y; m.rotation.y = seed + i * 0.7; m.castShadow = m.receiveShadow = true; G.add(m); });
    scene.add(G); return G;
  }
  altar(ALT_Q, 3); altar(ALT_H, 11);
  const ALT_TOP = 1.06;

  // sheaves (Qabil's crops): three upright bundles of stalks with grain heads, tied at the waist
  const stalkM = new THREE.MeshStandardMaterial({ color: 0xb4b0a4, roughness: 0.8 });
  const NST = 150, stalks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.008, 1, 4), stalkM, NST);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), stalkM, NST);
  stalks.castShadow = heads.castShadow = true;
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3();
    for (let i = 0; i < NST; i++) {
      const b = i % 3, bx = ALT_Q.x - 0.28 + b * 0.28, bz = ALT_Q.z + (b === 1 ? -0.12 : 0.1);
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.07, len = 0.75 + rnd() * 0.2;
      const lean = 0.06 + rr * 2.2;
      e.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); q.setFromEuler(e);
      up.set(0, 1, 0).applyQuaternion(q);
      const base = v.set(bx + Math.cos(a) * rr * 0.6, ALT_TOP, bz + Math.sin(a) * rr * 0.6);
      m.compose(new THREE.Vector3().copy(base).addScaledVector(up, len / 2), q, s.set(1, len, 1)); stalks.setMatrixAt(i, m);
      m.compose(new THREE.Vector3().copy(base).addScaledVector(up, len + 0.04), q, s.set(0.016, 0.06, 0.016)); heads.setMatrixAt(i, m);
    } }
  scene.add(stalks); scene.add(heads);
  for (let b = 0; b < 3; b++) { const tie = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 16), stalkM); tie.rotation.x = Math.PI / 2; tie.position.set(ALT_Q.x - 0.28 + b * 0.28, ALT_TOP + 0.32, ALT_Q.z + (b === 1 ? -0.12 : 0.1)); scene.add(tie); }

  // lamb (Habil's offering): lying wool body of soft spheres, head and folded legs
  const lamb = new THREE.Group(); lamb.position.set(ALT_H.x, ALT_TOP, ALT_H.z); lamb.rotation.y = -0.5; scene.add(lamb);
  const woolM = new THREE.MeshStandardMaterial({ color: 0xd8d8d4, roughness: 1, transparent: true });
  const faceM = new THREE.MeshStandardMaterial({ color: 0x9a9a96, roughness: 0.9, transparent: true });
  { const lr = mulberry(33);
    for (let i = 0; i < 26; i++) { const a = lr() * Math.PI * 2, u = lr() * 2 - 1; const m = new THREE.Mesh(new THREE.SphereGeometry(0.1 + lr() * 0.05, 10, 8), woolM); m.position.set(Math.cos(a) * Math.sqrt(1 - u * u) * 0.16, 0.17 + u * 0.08 + 0.04, Math.sin(a) * Math.sqrt(1 - u * u) * 0.3 - 0.02); m.castShadow = true; lamb.add(m); }
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), faceM); hd.scale.set(0.85, 0.9, 1.35); hd.position.set(0, 0.33, 0.33); hd.castShadow = true; lamb.add(hd);
    const hw = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), woolM); hw.position.set(0, 0.38, 0.27); lamb.add(hw);
    for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), faceM); ear.scale.set(1.2, 0.35, 0.6); ear.position.set(s * 0.1, 0.36, 0.28); ear.rotation.z = s * 0.4; lamb.add(ear); }
    for (const [x, z] of [[-0.12, 0.2], [0.12, 0.18], [-0.12, -0.2], [0.12, -0.22]]) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.18, 6), faceM); lg.rotation.x = Math.PI / 2; lg.position.set(x, 0.04, z + 0.06); lamb.add(lg); } }

  // ---------- AUDIRA carved stone at the edge of the plain
  const stone = new THREE.Mesh((() => {
    const g = new THREE.IcosahedronGeometry(1, 3); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + (fbm(x * 2 + 5, z * 2 + y * 3) - 0.5) * 0.35; x *= n; y *= n; z *= n; y = Math.min(y, 0.82 + 0.06 * hash(x * 9, z * 9)); z = Math.min(z, 0.55); p.setXYZ(i, x * 0.62, y * 0.68, z * 0.42); }
    g.computeVertexNormals(); return g; })(), new THREE.MeshStandardMaterial({ color: 0x9c9c98, roughness: 0.9, map: rockBump, bumpMap: rockBump, bumpScale: 3 }));
  stone.position.set(STONE.x, 0.46, STONE.z); stone.rotation.y = 0.35; stone.castShadow = stone.receiveShadow = true; scene.add(stone);
  const STONE_TOP = 0.46 + 0.68 * 0.82;
  const carve = canvasTex(1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.font = "600 150px 'Cormorant SC','Libre Baskerville',Georgia,serif"; g.textAlign = "center"; g.textBaseline = "middle";
    const txt = "A U D I R A";
    g.fillStyle = "rgba(255,255,255,.38)"; g.fillText(txt, w / 2 + 3, h / 2 + 5);
    g.fillStyle = "rgba(0,0,0,.82)"; g.fillText(txt, w / 2, h / 2);
    g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(130, h - 30); g.lineTo(w - 130, h - 30); g.stroke();
  });
  const carveP = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshStandardMaterial({ map: carve, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  carveP.position.set(0, 0.06, 0.55 * 0.42 + 0.004); stone.add(carveP);

  // ---------- the two sons of Adam: faceless robed silhouettes
  const figM = () => new THREE.MeshStandardMaterial({ color: 0x020202, roughness: 1, envMapIntensity: 0, transparent: true });
  function figure(mat) {
    const G = new THREE.Group(); scene.add(G);
    const mk = (geo, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
    const rg2 = new THREE.CylinderGeometry(0.17, 0.32, 1.22, 18); rg2.translate(0, 0.61, 0);
    const robe = mk(rg2, 0, 0, 0, G);
    const up = new THREE.Group(); up.position.y = 1.2; G.add(up);
    mk(new THREE.CylinderGeometry(0.21, 0.18, 0.36, 14), 0, 0.17, 0, up);
    const sh = mk(new THREE.SphereGeometry(0.21, 14, 10), 0, 0.33, 0, up); sh.scale.set(1.15, 0.5, 0.8);
    const head = new THREE.Group(); head.position.set(0, 0.42, 0.01); up.add(head);
    mk(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), 0, 0.03, 0, head);
    const hd = mk(new THREE.SphereGeometry(0.115, 14, 12), 0, 0.15, 0.01, head); hd.scale.set(0.92, 1.05, 1.0);
    const hood = mk(new THREE.SphereGeometry(0.13, 14, 10, 0, Math.PI * 2, 0, 2.0), 0, 0.17, -0.025, head); hood.rotation.x = -0.25;
    const arm = (s) => { const p = new THREE.Group(); p.position.set(s * 0.235, 0.3, 0); up.add(p); const ag = new THREE.CylinderGeometry(0.06, 0.05, 0.6, 8); ag.translate(0, -0.3, 0); mk(ag, 0, 0, 0, p); const hand = mk(new THREE.SphereGeometry(0.05, 8, 6), 0, -0.62, 0, p); return { p, hand }; };
    const L = arm(1), R = arm(-1);
    return { G, robe, up, head, L, R, mat };
  }
  const QM = figM(), HM = figM();
  const Q = figure(QM), Hb = figure(HM);
  const staffM = new THREE.MeshStandardMaterial({ color: 0x8a8580, roughness: 0.8, transparent: true });
  const sg = new THREE.CylinderGeometry(0.022, 0.026, 1.9, 6); sg.translate(0, 0.95, 0);
  const staff = new THREE.Mesh(sg, staffM); staff.castShadow = true; scene.add(staff);
  const crook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 12, Math.PI * 1.2), staffM); crook.position.set(0.09, 1.9, 0); crook.castShadow = true; staff.add(crook);

  function pose(F, o) {
    F.G.position.set(o.x, 0, o.z); F.G.rotation.y = o.yaw;
    const kn = o.kneel || 0;
    F.robe.scale.set(1, 1 - 0.55 * kn, 1 + 0.15 * kn);
    F.robe.rotation.z = (o.sway || 0);
    F.up.position.set(0, 1.2 - 0.66 * kn + (o.bob || 0), 0.05 * kn);
    F.up.rotation.x = (o.lean || 0) + 0.75 * kn;
    F.head.rotation.x = (o.nod || 0) + 0.5 * kn;
    F.L.p.rotation.set(-(o.armL || 0) - 0.9 * kn, 0, 0.08);
    F.R.p.rotation.set(-(o.armR || 0) - 0.9 * kn, 0, -0.08);
  }

  // positions through the story
  const QA = { x: ALT_Q.x + 0.55, z: ALT_Q.z - 1.2 }, HA = { x: ALT_H.x - 0.55, z: ALT_H.z - 1.2 };
  const QW = { x: -0.78, z: -7.2 }, HW = { x: 0.78, z: -7.2 };
  const QL = { x: -0.42, z: -4.9 };            // s5: steps toward the light, his shadow looms
  const QK = { x: -0.55, z: -7.5 };            // after the iris: alone, then kneels in s6
  const walk = (t) => ramp(t, tTrad - 0.2, K.s3 + 1.6);
  const shown = (t) => 1 - ramp(t, K.s3 + 0.6, K.s3 + 1.6) + ramp(t, tCrow - 1.0, tCrow + 0.5) * (t > tOpen ? 1 : 0);

  // ---------- fire on Habil's altar (the only colour)
  const FU = { uT: { value: 0 }, uA: { value: 0 } };
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.75, 1, 40, 24, true).translate(0, 0.5, 0), new THREE.ShaderMaterial({
    uniforms: FU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying vec2 vU;varying vec3 vN;varying vec3 vV;void main(){vU=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float uT,uA;varying vec2 vU;varying vec3 vN;varying vec3 vV;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1,0)),u.x),mix(hsh(i+vec2(0,1)),hsh(i+vec2(1,1)),u.x),u.y);}
void main(){float f=vn(vec2(vU.x*14.,vU.y*5.-uT*3.2))*.6+vn(vec2(vU.x*30.,vU.y*11.-uT*5.))*.4;
 float edge=pow(abs(dot(vN,vV)),1.4);float fall=pow(1.-vU.y,1.3)*smoothstep(0.,.05,vU.y);
 float a=uA*edge*fall*smoothstep(.25,.75,f+.35*(1.-vU.y));
 vec3 c=mix(vec3(.35,.02,.01),vec3(.85,.12,.04),f*(1.-vU.y*.7));gl_FragColor=vec4(c*a*.75,1.);}`,
  }));
  column.position.set(ALT_H.x, ALT_TOP - 0.05, ALT_H.z); column.frustumCulled = false; scene.add(column);
  const flames = pts(scene, 700, { color: 0xff3010, size: 0.22 });
  const fseed = Array.from({ length: 700 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const fireA = (t) => ramp(t, tAcc - 0.45, tAcc + 0.25) * (1 - ramp(t, tTrad, K.s3 + 1.4));
  const emberA = (t) => (t > tAcc ? 1 : 0) * (1 - ramp(t, K.s4, K.s5));

  // ---------- the crow
  const crowM = new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 0.32, metalness: 0.35 });
  const featherTex = canvasTex(64, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.beginPath(); g.moveTo(w / 2, 2); g.bezierCurveTo(w * 0.98, h * 0.18, w * 0.92, h * 0.8, w / 2, h - 2); g.bezierCurveTo(w * 0.08, h * 0.8, w * 0.02, h * 0.18, w / 2, 2); g.closePath();
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#5a5a5e"); gr.addColorStop(0.5, "#b0b0b0"); gr.addColorStop(1, "#6a6a6e"); g.fillStyle = gr; g.fill();
    g.save(); g.clip(); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1;
    for (let y = 8; y < h; y += 5) { g.beginPath(); g.moveTo(w / 2, y); g.lineTo(2, y + 14); g.moveTo(w / 2, y); g.lineTo(w - 2, y + 14); g.stroke(); }
    g.restore(); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h - 2); g.lineTo(w / 2, 6); g.stroke();
  });
  const featherM = new THREE.MeshStandardMaterial({ color: 0x070708, map: featherTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.45, metalness: 0.12 });
  const crow = new THREE.Group(); scene.add(crow);
  const body = new THREE.Group(); body.position.y = 0.17; crow.add(body);
  const cmk = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const RX = 0.075, RY = 0.07, RZ = 0.15;
  cmk(new THREE.SphereGeometry(1, 24, 18), crowM, 0, 0, 0, body).scale.set(RX, RY, RZ);
  { // contour feathers laid over the body, tips pointing back
    const NF = 170, fgeo = new THREE.PlaneGeometry(0.05, 0.075); fgeo.translate(0, 0.03, 0);
    const im = new THREE.InstancedMesh(fgeo, featherM, NF); im.castShadow = true;
    const m = new THREE.Matrix4(), n = new THREE.Vector3(), tt = new THREE.Vector3(), b = new THREE.Vector3(), p = new THREE.Vector3(), back = new THREE.Vector3(0, 0, -1), sc = new THREE.Vector3(1, 1, 1), q = new THREE.Quaternion();
    const fr = mulberry(5);
    for (let i = 0; i < NF; i++) {
      const u = -0.85 + 1.65 * (i / NF), a = i * 2.39996 + fr() * 0.4, c = Math.sqrt(Math.max(0, 1 - u * u));
      p.set(RX * c * Math.cos(a), RY * c * Math.sin(a), RZ * u);
      n.set(p.x / (RX * RX), p.y / (RY * RY), p.z / (RZ * RZ)).normalize();
      tt.copy(back).addScaledVector(n, -back.dot(n)).normalize();
      b.crossVectors(tt, n);
      m.makeBasis(b, tt, n); q.setFromRotationMatrix(m);
      sc.setScalar(0.8 + 0.4 * fr() + (u > 0.5 ? -0.25 : 0));
      m.compose(p.addScaledVector(n, 0.004), q, sc); im.setMatrixAt(i, m);
    }
    body.add(im);
  }
  const headG = new THREE.Group(); headG.position.set(0, 0.045, 0.14); body.add(headG);
  cmk(new THREE.SphereGeometry(0.052, 18, 14), crowM, 0, 0.0, 0.0, headG).scale.set(0.95, 0.95, 1.18);
  cmk(new THREE.SphereGeometry(0.05, 12, 10), crowM, 0, -0.025, -0.035, headG); // throat
  const beakM = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.25, metalness: 0.4 });
  const ub = cmk(new THREE.ConeGeometry(0.019, 0.085, 10), beakM, 0, 0.004, 0.09, headG); ub.rotation.x = Math.PI / 2; ub.scale.set(0.72, 1, 1.1);
  const lbP = new THREE.Group(); lbP.position.set(0, -0.006, 0.05); headG.add(lbP);
  const lb = cmk(new THREE.ConeGeometry(0.014, 0.07, 8), beakM, 0, -0.004, 0.034, lbP); lb.rotation.x = Math.PI / 2; lb.scale.set(0.7, 1, 0.6);
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x020202, roughness: 0.04, metalness: 0.1 });
  for (const s of [-1, 1]) cmk(new THREE.SphereGeometry(0.0085, 10, 8), eyeM, s * 0.036, 0.014, 0.03, headG);
  // wings: secondaries, primaries and coverts on a shoulder pivot; fan opens with f, pivot folds them along the back
  function wing(s) {
    const P = new THREE.Group(); P.position.set(s * 0.055, 0.035, 0.045); body.add(P);
    const F = [];
    const add = (d, phi, len, wid, y) => {
      const g = new THREE.PlaneGeometry(wid, len); g.rotateZ(-Math.PI / 2); g.rotateX(-Math.PI / 2); g.translate(s * len / 2, 0, 0);
      const m = new THREE.Mesh(g, featherM); m.castShadow = true; P.add(m); F.push({ m, d, phi, y });
    };
    for (let j = 0; j < 8; j++) add(0.02 + j * 0.022, 1.45 + 0.05 * Math.sin(j), 0.15, 0.045, -0.002 * j);
    for (let j = 0; j < 8; j++) add(0.2 + j * 0.006, 1.25 - j * 0.15, 0.2 + j * 0.008, 0.042, -0.02 + 0.002 * j);
    for (let j = 0; j < 7; j++) add(0.02 + j * 0.026, 1.5, 0.085, 0.04, 0.006);
    return { P, F, s };
  }
  const WL = wing(1), WR = wing(-1);
  const tail = new THREE.Group(); tail.position.set(0, 0.0, -0.12); body.add(tail);
  const TF = [];
  for (let j = 0; j < 7; j++) { const g = new THREE.PlaneGeometry(0.045, 0.18); g.rotateX(-Math.PI / 2); g.translate(0, 0, -0.09); const m = new THREE.Mesh(g, featherM); m.castShadow = true; m.position.y = -0.002 * Math.abs(j - 3); tail.add(m); TF.push({ m, a: (j - 3) / 3 }); }
  const legM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.2 });
  function leg(s) {
    const P = new THREE.Group(); P.position.set(s * 0.028, 0.14, 0.0); crow.add(P);
    const lg = new THREE.CylinderGeometry(0.0055, 0.0065, 0.13, 6); lg.translate(0, -0.065, 0); cmk(lg, legM, 0, 0, 0, P);
    for (const [a, l] of [[-0.35, 0.05], [0, 0.058], [0.35, 0.05], [Math.PI, 0.04]]) { const tg2 = new THREE.CylinderGeometry(0.003, 0.004, l, 5); tg2.rotateX(Math.PI / 2); tg2.translate(0, 0, l / 2); const m = cmk(tg2, legM, 0, -0.135, 0, P); m.rotation.y = a; }
    return P;
  }
  const LL = leg(1), LR = leg(-1);

  function setWing(W, fold, flap, sweep) {
    for (const o of W.F) { const dd = o.d * (0.32 + 0.68 * (1 - fold)); o.m.position.set(W.s * dd, o.y + 0.003 * fold, 0); o.m.rotation.set(0, W.s * o.phi * (1 - fold) * (1 - 0.15 * sweep), 0); }
    W.P.rotation.set(0, W.s * (Math.PI / 2 * fold + sweep * 0.3), W.s * (flap * (1 - fold) - 1.1 * fold), "ZYX");
  }

  // crow behaviour by time
  const SPOT_ON_STONE = new THREE.Vector3(STONE.x + 0.02, STONE_TOP - 0.01, STONE.z - 0.04);
  const DIGP = new THREE.Vector3(D.x + 0.26, 0, D.z - 0.04);
  const DIGYAW = Math.atan2(-1, 0.18);
  const flyOff = (u) => new THREE.Vector3().copy(SPOT_ON_STONE).lerp(new THREE.Vector3(4, 9, -16), u).add(new THREE.Vector3(0, Math.sin(u * Math.PI) * 1.5, 0));
  const landFrom = new THREE.Vector3(D.x + 3.2, 3.4, D.z + 2.2);
  const flyAway = (u) => new THREE.Vector3().copy(DIGP).lerp(new THREE.Vector3(-14, 9, 12), u).add(new THREE.Vector3(0, Math.sin(u * Math.PI) * 1.2 - 0.6 * u * u, 0));
  const cv = new THREE.Vector3(), cv2 = new THREE.Vector3();
  function crowAt(t) {
    const st = { vis: true, x: 0, y: 0, z: 0, yaw: 0, pitch: -0.32, fold: 1, flap: 0, sweep: 0, hy: 0, hx: 0, beak: 0, kl: 0, kr: 0, tail: 0.2 };
    const flying = (u0, u1, path, tt) => {
      const u = clamp01((tt - u0) / (u1 - u0)), e = u * u * (3 - 2 * u);
      const p = path(e), p2 = path(Math.min(1, e + 0.02));
      st.x = p.x; st.y = p.y; st.z = p.z; st.yaw = Math.atan2(p2.x - p.x, p2.z - p.z);
      st.fold = 0; st.flap = 0.25 + 0.75 * Math.sin(tt * 15); st.pitch = 0.05 - 0.15 * Math.sin(tt * 15); st.kl = st.kr = 1.3; st.tail = 0.8; st.sweep = 0.2 * Math.sin(tt * 15 + 1);
    };
    if (t < K.s2 + 0.3) {
      st.x = SPOT_ON_STONE.x; st.y = SPOT_ON_STONE.y; st.z = SPOT_ON_STONE.z; st.yaw = 1.45;
      st.hy = 0.5 * Math.sin(t * 0.9) * (1 - ramp(t, tCaw - 0.5, tCaw)) + (t > tCaw ? 0.25 * Math.sin(t * 1.7) : 0);
      const caw = Math.max(0, Math.sin(clamp01((t - tCaw) / 0.55) * Math.PI)) + Math.max(0, Math.sin(clamp01((t - tCaw - 0.75) / 0.5) * Math.PI)) * 0.8;
      st.beak = 0.5 * caw; st.hx = -0.35 * caw; st.pitch = -0.32 - 0.15 * caw;
      const ruf = Math.max(0, Math.sin(clamp01((t - tBury1) / 0.8) * Math.PI));
      st.fold = 1 - 0.35 * ruf; st.flap = 0.4 * ruf; st.hx += 0.5 * Math.max(0, Math.sin(clamp01((t - tBury1 - 0.6) / 0.5) * Math.PI));
      if (t > K.s2 - 0.3) { const k = ramp(t, K.s2 - 0.3, K.s2 + 0.3); st.fold = 1 - k; st.flap = k * Math.sin(t * 15); st.pitch -= 0.2 * k; }
      return st;
    }
    if (t < K.s2 + 3.2) { flying(K.s2 + 0.3, K.s2 + 3.2, flyOff, t); return st; }
    if (t < tCrow - 1.2) { st.vis = false; return st; }
    if (t < tLand) {
      const u = clamp01((t - (tCrow - 1.2)) / (tLand - tCrow + 1.2)), e = 1 - Math.pow(1 - u, 2.2);
      cv.copy(landFrom).lerp(DIGP, e); cv.y += Math.sin(e * Math.PI) * 0.25 * (1 - e);
      st.x = cv.x; st.y = cv.y; st.z = cv.z; st.yaw = DIGYAW + (1 - e) * 0.9;
      st.fold = 0; st.flap = 0.3 + 0.7 * Math.sin(t * (14 + 8 * e)); st.pitch = -0.6 * e; st.kl = st.kr = 0.3 * (1 - e); st.tail = 1; st.sweep = -0.5 * e;
      if (u > 0.85) { const k = (u - 0.85) / 0.15; st.fold = k * 0.0; st.flap = 0.9 - 0.4 * k; }
      return st;
    }
    // on the ground at the hollow
    st.x = DIGP.x; st.y = 0; st.z = DIGP.z; st.yaw = DIGYAW;
    const settle = ramp(t, tLand, tLand + 0.5);
    st.fold = settle; st.flap = (1 - settle) * 0.8;
    const look = t > tWoe - 0.2 && t < tWoe + 1.8 ? Math.sin(clamp01((t - tWoe + 0.2) / 2.0) * Math.PI) : 0;
    const digging = t > tDig0 && t < tDig1 + 0.2 ? 1 - look : 0;
    const P = 0.82, ph = ((t - tDig0) / P) % 1, cyc = Math.floor((t - tDig0) / P);
    const kick = digging * Math.max(0, Math.sin(ph * Math.PI * 2));
    const peck = digging * (cyc % 2 === 1 ? Math.max(0, Math.sin(ph * Math.PI)) : 0);
    st.kl = cyc % 2 === 0 ? kick * 0.9 : 0; st.kr = cyc % 2 === 0 ? 0 : kick * 0.6;
    st.pitch = -0.18 + 0.55 * peck + 0.12 * kick; st.hx = 0.9 * peck; st.hy = 0.15 * Math.sin(t * 2.3) * (1 - look) - 1.0 * look;
    st.y = 0.012 * kick; st.tail = 0.35 + 0.25 * kick;
    st.fold = Math.min(st.fold, 1 - 0.18 * kick); st.flap = st.flap + 0.25 * kick;
    st.beak = 0.15 * peck;
    if (t > tCrow2 - 0.1 && t < tCrow2 + 0.9) { const c = Math.sin(clamp01((t - tCrow2 + 0.1) / 0.9) * Math.PI); st.beak = Math.max(st.beak, 0.45 * c); st.hx = -0.3 * c; }
    if (t > K.s7 + 1.5 && t < tFly) { st.pitch = -0.32; st.hx = 0; st.hy = 0.6 * Math.sin(t * 0.5); }
    if (t >= tFly) flying(tFly, tFly + 4.5, flyAway, t);
    return st;
  }
  function placeCrow(t) {
    const s = crowAt(t);
    crow.visible = s.vis; if (!s.vis) return s;
    crow.position.set(s.x, s.y + H(s.x, s.z) * (s.y < 0.05 ? 1 : 0), s.z); crow.rotation.y = s.yaw;
    body.rotation.x = s.pitch; headG.rotation.set(s.hx, s.hy, 0); lbP.rotation.x = s.beak;
    setWing(WL, s.fold, s.flap, s.sweep); setWing(WR, s.fold, s.flap, s.sweep);
    tail.rotation.x = -0.15 + 0.25 * s.tail * 0.3; TF.forEach((o) => { o.m.rotation.y = o.a * 0.45 * s.tail; });
    LL.rotation.x = s.kl; LR.rotation.x = s.kr;
    return s;
  }

  // ---------- particles
  const soil = pts(scene, 216, { color: 0x3a3a38, size: 0.025, add: false, opacity: 0.95 });
  const motes = pts(scene, 420, { color: 0xffffff, size: 0.05, opacity: 0.5 });
  const mseed = Array.from({ length: 420 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const dust = pts(scene, 520, { color: 0x9a9a9a, size: 0.09, add: false, opacity: 0.35 });
  const dseed = Array.from({ length: 520 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const NL = 4096;
  const field = pts(scene, NL, { color: 0xffffff, size: 0.3, opacity: 1 });
  const glow = pts(scene, 1, { color: 0xffffff, size: 0.7, opacity: 1 });
  const FC = { x: D.x, z: D.z + 0.9 };
  const LP = [];
  for (let i = 0; i < NL; i++) {
    if (i === 0) { LP.push([FC.x, FC.z]); continue; }
    const rr2 = 0.5 * Math.sqrt(i + 0.5), a = (i * 2.399963) % (Math.PI * 2);
    LP.push([FC.x + rr2 * Math.cos(a) * 1.1, FC.z + rr2 * Math.sin(a) * 0.9]);
  }
  const LY = LP.map(([x, z]) => H(x, z) + 0.18);
  const LJ = Array.from({ length: NL }, (_, i) => hash(i * 0.731, 7.7));
  const STEP = 0.24, tGrow = tOne2 + 0.25;

  // ---------- camera
  const camA = track([
    [0, -5.05, 1.4, 6.6, -6.3, 0.9, 2.55],
    [3.5, -4.95, 1.45, 6.9, -6.3, 0.9, 2.55],
    [tCaw + 1.2, -4.7, 1.5, 7.4, -6.2, 0.92, 2.5],
    [K.s1e, -4.0, 1.9, 9.0, -4.6, 1.0, 0.6],
    [K.s2 + 2.2, -0.2, 2.8, 10.0, 0.1, 1.05, -4.5],
    [tAcc - 1.2, 0.4, 2.2, 5.0, 1.8, 1.45, -4.0],
    [tAcc + 1.4, 0.3, 2.7, 4.4, 1.9, 2.4, -4.0],
    [tNot + 0.6, -0.6, 2.0, 2.4, -2.0, 1.35, -4.2],
    [tTrad + 1.0, -0.8, 2.6, 5.2, -0.2, 1.2, -5.6],
    [K.s2e, 0, 2.6, 4.0, 0, 1.3, -8],
    [K.s3 + 2.2, 0, 1.85, 0.2, 0, 1.55, WALL_Z],
    [K.s3e, 0.1, 1.8, -0.3, 0, 1.55, WALL_Z],
    [tFear, -0.15, 1.85, 0.0, -0.1, 1.6, WALL_Z],
    [K.s4e, 0, 2.0, 0.6, -0.2, 1.75, WALL_Z],
    [tKill, 0, 2.1, 0.9, -0.2, 1.85, WALL_Z],
    [tOpen, 0.5, 1.5, -0.6, 0.4, 0.95, WALL_Z],
    [K.s5e, 0.45, 1.55, -0.9, 0.3, 1.0, WALL_Z],
    [tCrow - 0.6, 2.2, 1.35, -1.9, 0.6, 0.65, D.z - 1.5],
    [tLand + 0.4, 1.45, 0.95, -3.9, 0.58, 0.12, D.z - 0.1],
    [tWoe - 1.2, 1.3, 1.0, -4.05, 0.55, 0.1, D.z - 0.1],
    [tWoe + 0.6, 1.7, 0.95, -2.6, 0.0, 0.45, D.z - 1.0],
    [tCrow2 + 0.4, 1.5, 0.8, -3.0, 0.2, 0.35, D.z - 0.7],
    [K.s6e, 1.25, 1.05, -3.9, 0.5, 0.1, D.z - 0.1],
    [tOne, 0.7, 3.2, 0.6, 0.5, 0.3, D.z],
    [tAll + 0.6, 0.6, 12, 3.5, 0.5, 0, D.z + 0.6],
    [tOne2, 0.6, 15, 4.5, 0.5, 0, D.z + 1.0],
    [K.s7e, 0.5, 30, 14, 0.5, 0, D.z + 3],
    [K.s8 + 3.2, -1.5, 12, 20, -2.5, 0.3, -1],
    [tKisah - 0.6, -4.5, 1.7, 7.9, -6.3, 0.72, 2.6],
    [K.dur, -4.7, 1.6, 7.4, -6.4, 0.72, 2.6],
  ]);
  const look = new THREE.Vector3();
  const fm = new THREE.Vector3(), hp = new THREE.Vector3(), tv = new THREE.Vector3();

  return (t) => {
    const c = camA(t);
    const drift = 1 - 0.85 * (t > tLand && t < K.s6e ? 1 : 0);
    cam.position.set(c[0] + Math.sin(t * .27) * .05 * drift, c[1] + Math.sin(t * .21) * .04 * drift, c[2] + Math.cos(t * .3) * .05 * drift);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);
    cam.fov = 38; cam.updateProjectionMatrix();

    // light plot: moonlit plain (s1-s2), hard spot on the wall (s3-s6), night field (s7), grey dawn (s8)
    const wallPh = ramp(t, K.s3 - 0.4, K.s3 + 1.4) * (1 - ramp(t, K.s7 + 0.5, K.s7 + 4));
    const dawn = ramp(t, K.s8, K.s8 + 6);
    const night7 = ramp(t, K.s7, K.s7 + 2.5) * (1 - dawn);
    key.intensity = 4.2 * (1 - 0.92 * wallPh) * (1 - 0.75 * night7) + 0.3 * dawn;
    key.position.copy(look).addScaledVector(KEYDIR, 40); key.target.position.copy(look);
    spot.intensity = 7.5 * wallPh * (t > tKill + 0.02 && t < tShut + 0.4 ? 0.4 : 1);
    const crowPh = ramp(t, tCrow - 1, tCrow) * (1 - ramp(t, K.s7, K.s7 + 2));
    crowL.intensity = 1.6 * crowPh;
    rim.intensity = 0.9 * (1 - 0.6 * wallPh) + 1.2 * crowPh;
    hemi.intensity = 0.22 * (1 - 0.55 * wallPh) + 0.8 * night7 + 0.25 * dawn;
    SU.uT.value = t;
    SU.uHor.value.setScalar(0.16 + 0.05 * dawn - 0.06 * night7);
    scene.background.setScalar(0.1); scene.fog.color.setScalar(0.085 + 0.05 * dawn - 0.03 * night7);
    scene.fog.density = 0.02 - 0.012 * ramp(t, K.s7 + 1, K.s7e);
    const flick = 1 + 0.03 * Math.sin(t * 21.7) * Math.sin(t * 6.1) + 0.02 * Math.sin(t * 47.3);
    r.toneMappingExposure = 1.05 * flick;

    // fire
    const fa = fireA(t);
    FU.uT.value = t; FU.uA.value = fa;
    column.scale.set(1 + 0.3 * fa, 0.01 + 7.5 * eout(ramp(t, tAcc - 0.45, tAcc + 0.9)) * (0.25 + 0.75 * fa), 1 + 0.3 * fa);
    column.visible = fa > 0.01;
    const ea = emberA(t);
    fireL.intensity = 26 * fa + 2.2 * ea * (0.8 + 0.2 * Math.sin(t * 9)) ;
    const consume = ramp(t, tAcc, tAcc + 1.6);
    woolM.opacity = faceM.opacity = 1 - consume; lamb.visible = consume < 0.99;
    lamb.scale.setScalar(1 - 0.35 * consume); lamb.position.y = ALT_TOP + 0.4 * consume;
    for (let i = 0; i < 700; i++) {
      const s = fseed[i];
      const big = fa > 0.02, small = ea > 0.05 && t > tAcc + 0.5;
      if (!big && !small) { flames.pos[i * 3 + 1] = -99; continue; }
      const life = (t * (0.9 + s[1] * 0.9) + s[0]) % 1;
      const hgt = big ? (0.4 + 7 * fa * (0.3 + s[3] * 0.7)) : 0.25 + s[3] * 0.3;
      const rad = big ? 0.55 * (1 - life * 0.6) : 0.35;
      const a = s[2] * Math.PI * 2 + t * (0.5 + s[1]);
      if (!big && i > 260) { flames.pos[i * 3 + 1] = -99; continue; }
      flames.pos[i * 3] = ALT_H.x + Math.cos(a) * rad * (0.3 + s[3]) + Math.sin(t * 5 + s[0] * 30) * 0.06;
      flames.pos[i * 3 + 1] = ALT_TOP + life * hgt;
      flames.pos[i * 3 + 2] = ALT_H.z + Math.sin(a) * rad * (0.3 + s[3]);
      const v = big ? (1 - life) * Math.min(1, fa * 1.4) : (1 - life) * ea * 0.55 * (0.6 + 0.4 * Math.sin(t * 7 + i));
      flames.col[i * 3] = v; flames.col[i * 3 + 1] = v * (0.06 + 0.1 * (1 - life)); flames.col[i * 3 + 2] = v * 0.04;
    }
    flames.m.size = fa > 0.02 ? 0.22 : 0.07;
    flames.commit();

    // figures
    const w = walk(t);
    const wph = t * 5.2, walking = w > 0.01 && w < 0.99 ? 1 : 0;
    const qx0 = QA.x + (QW.x - QA.x) * w, qz0 = QA.z + (QW.z - QA.z) * w;
    const hx0 = HA.x + (HW.x - HA.x) * w, hz0 = HA.z + (HW.z - HA.z) * w;
    const loom = ramp(t, tLust - 0.2, tKill - 0.1);
    const after = t >= tShut + 0.15;
    const qx = after ? QK.x : qx0 + (QL.x - qx0) * loom, qz = after ? QK.z : qz0 + (QL.z - qz0) * loom;
    const threat = Math.max(Math.sin(clamp01((t - tThreat + 0.25) / 1.6) * Math.PI) * (t < tCalm ? 1 : 0), 0);
    const reach = ramp(t, tReach - 0.2, tReach + 0.6) * (1 - ramp(t, tFear, tFear + 1.2));
    const kneel = ramp(t, tWoe - 0.2, tWoe + 1.1);
    pose(Q, {
      x: qx, z: qz, yaw: w > 0.98 || t > K.s3 ? Math.PI / 2 : Math.atan2(QW.x - QA.x, QW.z - QA.z),
      sway: walking * 0.05 * Math.sin(wph), bob: walking * 0.02 * Math.abs(Math.sin(wph)),
      lean: 0.18 * threat + 0.12 * reach + 0.2 * loom * (after ? 0 : 1) + (after ? 0.05 : 0),
      armR: after ? 0 : 2.5 * threat + 1.45 * reach + 0.6 * loom, armL: after ? 0 : 0.35 * threat,
      nod: after ? 0.25 : -0.1 * threat, kneel,
    });
    const hcalm = ramp(t, tCalm - 0.3, tCalm + 0.5);
    pose(Hb, {
      x: hx0, z: hz0, yaw: w > 0.98 || t > K.s3 ? -Math.PI / 2 : Math.atan2(HW.x - HA.x, HW.z - HA.z),
      sway: walking * 0.05 * Math.sin(wph + 1.4), bob: walking * 0.02 * Math.abs(Math.sin(wph + 1.4)),
      armR: 0.55, armL: 0, nod: 0.12 * hcalm - 0.06 * reach, lean: -0.04 * threat,
    });
    Hb.G.visible = t < tShut;
    const so = shown(t);
    QM.opacity = so; HM.opacity = so; QM.depthWrite = HM.depthWrite = so > 0.5;
    // staff: in Habil's hand, then falls when the iris opens and lies on the ground
    if (t < tOpen) {
      Hb.G.updateMatrixWorld(true); Hb.R.hand.getWorldPosition(hp);
      staff.position.set(hp.x, 0, hp.z); staff.rotation.set(0, 0, 0.04 + walking * 0.03 * Math.sin(wph));
      staffM.opacity = so;
    } else {
      const u = clamp01((t - tOpen) / 0.62), fall = u * u;
      const bounce = u >= 1 ? Math.max(0, Math.sin(clamp01((t - tOpen - 0.62) / 0.3) * Math.PI)) * 0.08 * (1 - clamp01((t - tOpen - 0.62) / 0.3)) : 0;
      staff.position.set(HW.x + 0.1, 0.02, HW.z + 0.05); staff.rotation.set(0, 0, -(Math.PI / 2 - 0.035) * fall + bounce);
      staffM.opacity = ramp(t, tOpen, tOpen + 0.3);
    }
    staffM.depthWrite = staffM.opacity > 0.5;

    // crow and hollow
    const cs = placeCrow(t);
    setHollow(ramp(t, tDig0, tDig1));
    // soil kicked out of the hollow, a few clods per scratch
    const P = 0.82;
    const cyc = Math.floor((t - tDig0) / P);
    for (let j = 0; j < 3; j++) for (let k = 0; k < 72 / 1; k++) {
      const i = j * 72 + k; if (i >= 216) break;
      const cc = cyc - j, t0 = tDig0 + cc * P + 0.12, age = t - t0;
      const on = t > tDig0 && t < tDig1 + 0.6 && cc >= 0 && age > 0 && age < 0.9 && k < 14 && !(t > tWoe - 0.2 && t < tWoe + 1.8);
      if (!on) { soil.pos[i * 3 + 1] = -99; continue; }
      const h1 = hash(cc * 3.1 + k, 2.2), h2 = hash(cc * 1.7 + k * 3, 5.1), h3 = hash(k * 7.3, cc + 0.5);
      const vx = 0.5 + h1 * 0.9, vy = 0.6 + h2 * 0.9, vz = (h3 - 0.5) * 0.8, ta = Math.min(age, 0.45);
      soil.pos[i * 3] = D.x + 0.05 + vx * ta; soil.pos[i * 3 + 1] = Math.max(0.01, 0.02 + vy * ta - 4.9 * ta * ta); soil.pos[i * 3 + 2] = D.z + vz * ta;
    }
    soil.commit();

    // motes drifting in the spot beam
    for (let i = 0; i < 420; i++) {
      const s = mseed[i];
      if (wallPh < 0.02) { motes.pos[i * 3 + 1] = -99; continue; }
      const z = LIGHT.z - (s[0] * 15), sp = 0.15 + (LIGHT.z - z) * 0.17;
      motes.pos[i * 3] = (s[1] - 0.5) * 2 * sp + Math.sin(t * 0.3 + s[2] * 9) * 0.15;
      motes.pos[i * 3 + 1] = LIGHT.y + 0.6 + (s[2] - 0.35) * 2 * sp + ((t * 0.04 + s[3]) % 1) * 0.6;
      motes.pos[i * 3 + 2] = z;
      const v = 0.35 * wallPh * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + s[3] * 20)));
      motes.col[i * 3] = motes.col[i * 3 + 1] = motes.col[i * 3 + 2] = v;
    }
    motes.commit();
    // wind dust after the iris opens
    const wd = ramp(t, tOpen - 0.1, tOpen + 0.5) * (1 - ramp(t, tCrow - 0.5, tCrow + 1.5)) + 0.25 * ramp(t, K.s8, K.s8 + 3);
    for (let i = 0; i < 520; i++) {
      const s = dseed[i];
      if (wd < 0.02) { dust.pos[i * 3 + 1] = -99; continue; }
      const life = (t * (0.18 + s[0] * 0.2) + s[1]) % 1;
      dust.pos[i * 3] = 7 - life * 14; dust.pos[i * 3 + 1] = 0.05 + s[2] * 1.6 + Math.sin(life * 9 + s[3] * 9) * 0.2; dust.pos[i * 3 + 2] = -12.5 + s[3] * 10;
    }
    dust.m.opacity = 0.32 * wd; dust.commit();

    // s7 field of lights: one light dies, the field of all people appears and goes dark; one light again, then it multiplies
    for (let i = 0; i < NL; i++) {
      let v = 0, x = LP[i][0], z = LP[i][1], y = LY[i];
      const ghost = ramp(t, tAll - 0.15, tAll + 0.35) * (1 - ramp(t, tAll + 0.6 + LJ[i] * 0.4 + Math.sqrt(i) / 64 * 0.9, tAll + 1.0 + LJ[i] * 0.4 + Math.sqrt(i) / 64 * 0.9));
      if (t > tAll - 0.2 && t < tGrow + 3) v = Math.max(0.45 * ghost, 0.6 * ramp(t, tAll + 0.6, tAll + 1.6) * (1 - ramp(t, tGrow, tGrow + 3)));
      if (t >= tGrow) {
        const g = Math.floor(Math.log2(i + 1)), first = Math.pow(2, g) - 1;
        const ti = tGrow + g * STEP + ((i - first) / Math.pow(2, g)) * STEP * 0.7;
        if (i === 0 || t >= ti) {
          const u = i === 0 ? 1 : eout((t - ti) / 0.45);
          const p = i === 0 ? 0 : Math.floor((i - 1) / 2);
          x = LP[p][0] + (LP[i][0] - LP[p][0]) * u; z = LP[p][1] + (LP[i][1] - LP[p][1]) * u; y = LY[p] + (LY[i] - LY[p]) * u + Math.sin(u * Math.PI) * 0.3;
          v = Math.min(1, (t - (i === 0 ? tGrow : ti)) * 4) * (1.25 + 0.3 * Math.sin(t * 2.2 + LJ[i] * 30));
          v *= 1 - ramp(t, K.s8 + 2.5, tKisah - 0.4);
        }
      }
      if (v <= 0.002) { field.pos[i * 3 + 1] = -99; continue; }
      field.pos[i * 3] = x; field.pos[i * 3 + 1] = y; field.pos[i * 3 + 2] = z;
      field.col[i * 3] = v; field.col[i * 3 + 1] = v * 0.97; field.col[i * 3 + 2] = v * 0.9;
    }
    field.m.size = 0.42 + 0.2 * ramp(t, tGrow + 1, K.s7e);
    field.commit();
    // the single light (one life)
    const one = ramp(t, tOne - 0.1, tOne + 0.4) * (1 - ramp(t, tAll - 0.6, tAll - 0.1)) + ramp(t, tOne2 - 0.1, tOne2 + 0.4) * (1 - ramp(t, tGrow + 1.2, tGrow + 2.5));
    glow.pos[0] = FC.x; glow.pos[1] = LY[0] + 0.15; glow.pos[2] = FC.z;
    glow.col[0] = glow.col[1] = glow.col[2] = one;
    if (one < 0.01) glow.pos[1] = -99;
    glow.commit();

    bp.strength = 0.45 + 0.12 * fa + 0.25 * night7;
    comp.render();
  };
}
